'use babel';

import {TextEditor} from 'atom'

export default class EpitoolsInput{

    constructor(placeholder){
        this.isRemoving = false;
        this.show = false;
        this.element = document.createElement('epitoolsinput')
        this.element.classList.add('epitoolsdialog', 'overlay', 'from-top')

        this.editor = new TextEditor({mini: true})

        this.editor.setPlaceholderText(placeholder)
        this.editorElement = atom.views.getView(this.editor)

        this.errorMessage = document.createElement('div')
        this.errorMessage.classList.add('error')

        this.element.appendChild(this.editorElement)
        this.element.appendChild(this.errorMessage)

        this.editorElement.addEventListener('blur', this.cancel.bind(this))
    }

    get text(){
        return this.editor.getText();
    }

    onConfirm(){
        this.confirm(this.text);
    }

    setConfirm(confirm){
        this.confirm = confirm
    }

    setInput(input='', select=false){
        this.editor.setText(input)
        if (select){
            range = [[0, 0], [0, input.length]]
            this.editor.setSelectedBufferRange(range)
        }
    }

    showError(message=''){
        this.errorMessage.textContent(message)
    }

    attach(){
        if (this.show == false){
            this.disposable = atom.commands.add('body',{
                'core:confirm': () => this.onConfirm(),
                'core:cancel': () => this.cancel()
            })

            atom.views.getView(atom.workspace).appendChild(this.element)
            this.show = true;
            this.editorElement.focus()
        } else {
            console.log('already open')
        }
    }

    detach(){
        if (!this.element.parentNode.contains(this.element) || this.isRemoving)
            return false;

        this.isRemoving = true
        this.disposable.dispose()
        this.element.parentNode.removeChild(this.element)
        atom.workspace.getActivePane().activate()
        this.show = false;
        this.isRemoving = false
    }

    cancel(){
        this.detach();
    }
}
