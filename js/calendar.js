/**
 * Lays out events for a single  day
 * @param array  events   An array of event objects. Each event object consists of a start and end
 *                                     time  (measured in minutes) from 9am, as well as a unique id. The
 *                                     start and end time of each event will be [0, 720]. The start time will
 *                                     be less than the end time.
 * @return array  An array of event objects that has the width, the left and top positions set, in addition to the id,
 *                        start and end time. The object should be laid out so that there are no overlapping
 *                        events.
 */
function layOutDay(events) {
    var itree = new IntervalTree(360); //center of the tree. which is mid of the calendar.
    var event, width, layoutWidth = 600, idx = 0,i,eventsLength=events.length;
    for (i=0;i<eventsLength;i++) {
        event = events[i];
        itree.add(event.start, event.end, idx++);
    }
    for (i=0;i<eventsLength;i++) {
        event = events[i];
        if (!event.position) {
            var overlappedEvents = itree.search(event.start, event.end);
            if (overlappedEvents.length > 0) {
                var counter = 0, width = layoutWidth / overlappedEvents.length;
                overlappedEvents.forEach(function(result) {
                    event = events[result.id];
                    if (!event.position) {
                        event.position = {top : event.start, left:width * counter++,width:width};
                    }
                });
            } else {
                event.position = {top : event.start, left:0,width:layoutWidth};
            }
        }
    }
    return events;
}
    
$(document).ready(function() {
   
    var processedEvents = layOutDay([
        {id : 1, start : 30,  end : 150},// starts at 9:30 am and ends at 11:30 am
        {id : 2, start : 540, end : 600},// starts at 6:00 pm and ends at 7:00pm
        {id : 3, start : 560, end : 620},// starts at 6:20pm and ends at 7:20pm
        {id : 4, start : 610, end : 670} // starts at 7:10pm pm and ends at 8:10 pm
    ]);

    var eventHtml = $("#event-template").html();

    var eventDashBoard = $(".event-dashboard");

    processedEvents.forEach(function(event) {
        $(eventHtml).css({
            top:event.start,
            left:event.position.left + 10,
            height:event.end - event.start,
            width:event.position.width - 5
        }).appendTo(eventDashBoard);
    });
});
