'use babel';

import FileNorm from './file.json';

export default class EpitoolsNorm{

    constructor(editor){
        this.activated = false;
        this.defaultTabLength = 0;
        this.editor = editor;
        this.defaultTabLength = atom.config.get('editor.tabLength');
		let filename = this.editor.getTitle();
		let match = filename.match(/^(?:.*)\.(.*)$/);
		if (match){
			console.log(FileNorm.types[match[1]])
		} else {
			console.log(FileNorm.types[filename.toLowerCase()]);
		}
		if ((match && FileNorm.types[match[1]]) || FileNorm.types[filename.toLowerCase()]){
			this.activate = true
		} else {
			this.activate = false
		}
    }

    set activate(boolean){
        this.activated = boolean;
        if (this.activated == true){
            this.editor.setTabLength(8)
        } else {
            this.editor.setTabLength(this.defaultTabLength)
        }
    }

    replaceTabsBySpaces(str){
		var ch, i, ret, _i, _len;
		i = 0;
		ret = "";
		for (_i = 0, _len = str.length; _i < _len; _i++) {
			ch = str[_i];
			if (ch === '\t') {
				ret += " ".repeat(8 - i % 8);
				i += 8 - i % 8;
			} else {
				ret += ch;
				i += 1;
			}
		}
		return ret;
    }

    indent(e){
        if (this.activated == false || this.editor.hasMultipleCursors()){
			if (e){
            	e.abortKeyBinding()
			}
            return false;
        }

        this.editor.transact(() => {
            [saveRow, saveCol] = this.editor.getCursorBufferPosition().toArray();
            this.editor.moveToEndOfLine();
            [row, col] = this.editor.getCursorBufferPosition().toArray();
            line = this.editor.getText().split('\n')[row];
            indentedRow = this.getIndentedRow(row)
            this.editor.setTextInBufferRange([[row, 0],[row, col]], indentedRow)
			offset = (line.match(/.*\r.*/)) ? 1 : 0;
			this.editor.setCursorBufferPosition([saveRow, (saveCol + indentedRow.length - line.length + offset)])
        })
    }

    getIndentedRow(lineNb){
        let braces,
			c,
			ind,
			last,
			line,
			match,
			multiLines,
			parens,
			shift,
			skip,
			spacesBeforeArgs,
			temp,
			text,
			tmpLine;
		ind = 0;
		last = 0;
		text = this.editor.getText();
		spacesBeforeArgs = 0;
		skip = false;
		multiLines = false;
		braces = [];
		parens = [];
		lines = text.split("\n");
		for (i = 0; lines.length > i; i++) {
			line = lines[i];
			temp = line.replace(/^\s+/, "").replace(/\r/, "");
			shift = 0;

			if (line.match(/.*\}.*/)) {
				if (braces.length > 0) {
					shift = braces.pop();
				}
				if (shift === 0 && braces.length > 0 && braces[braces.length - 1] > 0) {
					shift = braces.pop();
				}
				ind -= 1 + last + shift;
				last = 0;
			}

			tmpLine = this.replaceTabsBySpaces(line);

			if (lineNb === 0 && parens.length > 0) {
				return "\t".repeat(parens[parens.length - 1] / 8 | 0) + " ".repeat(parens[parens.length - 1] % 8 * 2) + temp;
			}


			skip = parens.length > 0;

			c = 1;
			while (match = (new RegExp("(?:(.*?\\\(){" + c + "})")).exec(tmpLine)) {
				parens.push(match[0].length);
				c += 1;
			}

			c = 1;
			while (match = (new RegExp("(?:(.*?\\\)){" + c + "})")).exec(tmpLine)) {
				parens.pop();
				c += 1;
			}

			if (lineNb === 0) {
				ind += shift - (line.match(/.*[\{\}].*/) ? last : 0);
				if (ind < 1) {
					return temp;
				}
				if (line.match(/\s+[\{\}]\s*\r?/)) {
					ind += 0.5;
				} else if (last) {
					ind -= 0.5;
				}
				return "\t".repeat((ind * 2 - 1) / 4 | 0) + " ".repeat((ind * 2 - 1) % 4 * 2) + temp;
			}

			if (line.match(/.*\{.*/)) {
				ind += +1 - last;
				braces.push(0);
				last = 0;
			} else if (parens.length === 0 && line.match(/.*(if|while|for|do)\s*\(.*\).*;\s*\r?$/) || line.match(/.*else.*;\s*\r?$/)) {
				console.log("Condition closed");
			} else if (line.match(/.*else.*/) || line.match(/.*(if|while|for|do)\s*\(.*/)) {
				ind += 1;
				if (last) {
					if (!braces.length) {
						braces.push(0);
					}
					braces[braces.length - 1] = braces[braces.length - 1] + 1;
					console.log(braces);
					ind -= 0.5;
					console.log("(if|while|for|do) ind= " + ind);
				}
				last = 1;
			} else {
				if (parens.length === 0 && !skip) {
					if (last) {
						ind -= (braces.length > 0 && braces[braces.length - 1]) ? braces.pop() : 1;
					}
					last = 0;
				}
				if (!last) {
					if (line.match(/\=.*[^;\r][\s]*$/) || line.match(/\=.*[^;][\s]*\r$/)) {
						ind += 1;
						multiLines = true;
					} else {
						if (multiLines) {
							ind -= 1;
						}
						multiLines = false;
					}
				}
			}
			lineNb = lineNb - 1;
		}
		return "";
    }

    tab(e){
        if (!this.activated){
			if (e){
            	e.abortKeyBinding()
			}
        	return false;
        }
        this.editor.insertText('\t')
    }

    new_line(e){
        if (!this.activated){
			if (e){
            	e.abortKeyBinding()
			}
			return false;
        }

        this.editor.transact(() => {
            cursorPos = this.editor.getCursorBufferPosition().toArray()
            line = this.editor.getText().split('\n')[cursorPos[0]]
            if (line.charAt(cursorPos[1] - 1) == '{' && line.charAt(cursorPos[1]) == '}'){
                this.editor.insertText("\n\n")
                this.indent(e)
                this.editor.setCursorBufferPosition([cursorPos[0], 0])
                this.indent(e)
                this.editor.setCursorBufferPosition([cursorPos[0] + 2, 0])
                this.indent(e)
                this.editor.setCursorBufferPosition([cursorPos[0] + 1, 0])
                this.indent(e)
                this.editor.moveToEndOfLine()
            } else {
                this.editor.insertText('\n')
            }
            this.indent(e)
        })
    }
}
