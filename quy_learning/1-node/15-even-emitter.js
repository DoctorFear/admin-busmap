
const EvenEmitter = require('events');
const customEmitter = new EvenEmitter();

/*  on() & emit()
    keep trach of the order
    additional arguments
    built-in modules utilize it
*/

// on(): listen for event whose name: 'response',
// when this event is emitted -> run callback function
customEmitter.on('response', (name, id) => {
    console.log(`- Data recieved user ${name} - ${id}`)
})
// the second listener for event 'response'
customEmitter.on('response', () => {
    console.log(`- Call some logic function here`)
})

// emit(): trigger event 'response',
// all callback which registered by .on('response',...) will run
customEmitter.emit('response', 'doduyquy', 34)



