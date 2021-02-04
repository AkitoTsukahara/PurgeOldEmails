let LABELS = ['UFJ', 'slack', '楽天カード']
let CATEGORES = ['social', 'promotions']
let DELETE_AFTER_DAYS =60
let LENGTH_AT_ONCE = 500
let DURATION_MIN = 2

function setPurgeMoreTrigger() {
    ScriptApp.newTrigger('PurgeMore')
    .timeBased()
    .at(new Date((new Date()).getTime() + 1000 * 60 * DURATION_MIN))
    .create()
}

function removTriggers() {
    let triggers = ScriptApp.getProjectTriggers()

    for (let i = 0; i< triggers.length; i++) {
        let trigger = triggers[i]
        if (trigger.getHandlerFunction() === 'purgeMore') {
            ScriptApp.deleteTrigger(trigger)
        }
    }
}

function purgeMore() {
    purgeNow()
}

function purgeTarget(target,targetList) {

    let search = ''
    for (let i = 0; i< targetList.length; i++) {
        if (i > 0) {
            search += ' OR '
        }
        search += '('+ target +':' + targetList[i] + ' -in:starred -in:important older_than:' + DELETE_AFTER_DAYS + 'd)'
    }
    console.log('Search string is ' + search)

    let threads = GmailApp.search(search, 0, LENGTH_AT_ONCE)
    if (threads.length === LENGTH_AT_ONCE) {
        console.log('LENGTH_AT_ONCE exceeded. Setting another trigger to execute purgeMore function in ' + DURATION_MIN + 'min.')
        setPurgeMoreTrigger()
    }

    console.log('Processing ' + threads.length + 'threads')
    let cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - DELETE_AFTER_DAYS)
    for (let i = 0; i< threads.length; i++) {
        let thread = threads[i]
        if (thread.getLastMessageDate() < cutoff) {
            thread.moveToTrash()
        }
    }
}

function purgeNow() {
    removTriggers()
    purgeTarget('label',LABELS)
    purgeTarget('category',CATEGORES)
}