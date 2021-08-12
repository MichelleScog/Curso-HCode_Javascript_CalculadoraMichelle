class CalcController {
    constructor(){
        this._audio = new Audio('click.mp3'); // audio web api
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();
    }

    initialize(){
        this.setDisplayDateTime()
        setInterval(()=>{
            this.setDisplayDateTime();
        }, 1000);

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn =>{
            btn.addEventListener('dblclick', e=> {
                this.toggleAudio();
            });
        });
    }

    toggleAudio(){
        this._audioOnOff = !this._audioOnOff;
    }

    playAudio(){
        if(this._audioOnOff){
            this._audio.currentTime = 0;
            this._audio.play();
        };
    }

    copyToClipboard() {
        let input = document.createElement('input');
        input.value = this.displayCalc;
        document.body.appendChild(input);
        input.select();
        document.execCommand("Copy");
        input.remove();
    }

    pasteFromClipboard() {
        document.addEventListener('paste', e=> {
            let text = e.clipboardData.getData('Text');
            this.displayCalc = parseFloat(text);
            // console.log(text);
        });
    }

    initKeyboard(){
        document.addEventListener('keyup', e=> {
            this.playAudio();

            switch(e.key) {
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                break;
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                    break;
                case 'Enter':
                case '=':
                	this.calc();
                    break;
                case '.':
                case ',':
                    this.addDot();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;
                case 'c':
                    if(e.ctrlKey) this.copyToClipboard();
                    break;
            }
            // console.log(e.key);
        });
    }

    addEventListenerAll(element, events, fn) {
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        })
    }

    clearAll() {
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
    }

    clearEntry() {
        this._operation.pop();
        this.setLastNumberToDisplay();
    }

    getLastOperation() {
        return this._operation[this._operation.length-1];
    }

    setLastOperation(value) {
        this._operation[this._operation.length-1] = value;
    }

    isOperator(value) {
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1);
    }

    pushOperation(value){
        this._operation.push(value);
        if(this._operation.length > 3) {
            this.calc();
            // console.log();
        }
    }

    getResult(){
        try{
            return eval(this._operation.join(""));
        } catch(e) {
            setTimeout(() =>{
                this.setError();
            }, 1);
        // console.log(e);
        }
    }

    calc() {
        let last = '';
        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if(this._operation.length > 3) {
            last = this._operation.pop();
            this._lastNumber = this.getResult();
        } else if(this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false);
        }

        // console.log('_lastOperator', this._lastOperator);
        // console.log('_lastNumber', this._lastNumber);

        let result = this.getResult();
        if(last == '%') {
            result /= 100;
            this._operation = [result];
        } else {
            this._operation = [result];
            if(last) this._operation.push(last);
        }
        this.setLastNumberToDisplay();
    }

    getLastItem(isOperator = true) {
        //console.log(this._operation);
        let lastItem;
        for (let i = this._operation.length-1; i >= 0; i--) {

            if (this.isOperator(this._operation[i]) == isOperator) {
               	lastItem = this._operation[i];
                break;
            }
        }
        if(!lastItem) {
            // a = b -> if // ? -> then // : -> if not;
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }
        return lastItem;
    }

    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);
        if(!lastNumber) lastNumber = 0;
        this.displayCalc = lastNumber;
    }

    addOperation(value) {
        // console.log('A', value, isNaN(this.getLastOperation()));

        if(isNaN(this.getLastOperation())) {
            if(this.isOperator(value)) { // Typed value is a operator, must change operator
                this.setLastOperation(value);
            } else {
                // console.log('// Typed value is a number');
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }

        } else { // Last value is a number
            if(this.isOperator(value)) {
                // console.log('// Typed value is operator');
                this.pushOperation(value);
            } else {
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);
                this.setLastNumberToDisplay();
            }
        }
        // console.log(this._operation);
    }

    setError() {
        this.displayCalc = "Error";
    }

    addDot() {
        let lastOperation = this.getLastOperation();
            console.log(lastOperation);

        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if(this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.');
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }
        this.setLastNumberToDisplay();
    }

    execBtn(value) {
        this.playAudio();

        switch(value) {
            case 'ac': // All Clear (ou c)
                this.clearAll();
                break;
            case 'ce': // Cancel Entry
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;
        }
        // Just in case, show everytime a button is clicked or dragged
        // console.log(this._operation);
    }

    initButtonsEvents(){
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
        buttons.forEach((btn, index)=>{
            this.addEventListenerAll(btn, "click drag", e => {
                let textBtn = btn.className.baseVal.replace("btn-", "");
                // console.log(btn.className.baseVal.replace("btn-", ""));
                this.execBtn(textBtn);
            });
            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer";
            });
        });
    }

    setDisplayDateTime(){
        this.displayDate  = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);

    }

    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        return this._timeEl.innerHTML = value;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(value){
        return this._dateEl.innerHTML = value;
    }

    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){
        if(value.toString().length > 10) {
            this.setError();
            return false;
        }

        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this.currentDate = value;
    }
}
