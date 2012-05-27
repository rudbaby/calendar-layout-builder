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
    var i, k, oc, poic, event, width, buckets, bc, overlappedEvents, overlappedEvent, nextSlot, existingEvent, left;
    var layoutWidth = 600, idx = 0, eventsLength = events.length;
    for (i=0;i<eventsLength;i++) {
        event = events[i];
        if(event.start < 0 || event.start > 840){
            throw new Error('event time should be in between 0 to 840 ( 9AM to 9PM)');
        }
        itree.add(event.start, event.end-1, idx++);
    }
    for (i=0;i<eventsLength;i++) {
        event = events[i];
        if (!event.position) {
            overlappedEvents = itree.search(event.start, event.end-1);
            event.existingOverlappedEvents =  overlappedEvents;
            console.info(event.id, event.start, event.end,overlappedEvents.length,overlappedEvents);
            var totalDivisions = overlappedEvents.length;
            var divisionsRequired = 0;
            for(oc=0;oc <overlappedEvents.length;oc++){
                overlappedEvent = events[overlappedEvents[oc].id];
                divisionsRequired++;
                for(poic=oc-1;poic>=0;poic--){
                    var prevEvent = events[overlappedEvents[poic].id];
                        if(prevEvent.end <= overlappedEvent.start){
                            divisionsRequired--;
                        }
                }
            }
            totalDivisions = divisionsRequired;
            if (totalDivisions > 1) {
                width = layoutWidth / totalDivisions;
                buckets=[];for(bc=0;bc<overlappedEvents.length;bc++)buckets[bc]=0;
                for(oc=0;oc <overlappedEvents.length;oc++){
                    overlappedEvent = events[overlappedEvents[oc].id];
                    if (!overlappedEvent.position) {
                        var needSlot = true;
                        for(poic=oc-1;poic>=0;poic--){
                            var prevEvent = events[overlappedEvents[poic].id];
                            if(prevEvent.end <= overlappedEvent.start){
                                left= prevEvent.position.left;
                                needSlot = false;
                                console.info("no need for new slot");
                                break;
                            }
                        }
                        if(needSlot){
                            nextSlot = 0;while(buckets[nextSlot] != 0 && nextSlot < buckets.length) nextSlot++;
                            buckets[nextSlot]=1;
                            console.info("need slot buckets", buckets);
                            left=width * nextSlot;
                        }
                        overlappedEvent.position = {top : event.start, left:left,width:width};
                    } else {
                        if(overlappedEvent.existingOverlappedEvents){
                            k=0;
                            overlappedEvent.existingOverlappedEvents.forEach(function(evt){
                                existingEvent = events[evt.id];
                                existingEvent.position.width=width;
                                existingEvent.position.left=width * k;
                                if(overlappedEvent.id == existingEvent.id){
                                    buckets[k]=1;
                                    //console.info("inner buckets", buckets);
                                }
                                k=k+1;
                            });
                        }

                    }
                    overlappedEvent.existingOverlappedEvents =  overlappedEvents;
                }
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
        {id : 4, start : 600, end : 650} // starts at 7:10pm pm and ends at 8:10 pm
    ]);

   /* var processedEvents = layOutDay([
        {id : 1, start : 60, end : 120},// starts at 6:00 pm and ends at 7:00pm
        {id : 2, start : 60,  end : 90},// starts at 9:30 am and ends at 11:30 am
        {id : 3, start : 90, end : 120},// starts at 6:20pm and ends at 7:20pm
        {id : 4, start : 600, end : 650}, // starts at 7:10pm pm and ends at 8:10 pm
        {id : 5, start : 630, end : 650} // starts at 7:10pm pm and ends at 8:10 pm
    ]);*/
   /* var processedEvents = layOutDay([
        {id : 1, start : 30,  end : 150},// starts at 9:30 am and ends at 11:30 am
        {id : 2, start : 540, end : 600},// starts at 6:00 pm and ends at 7:00pm
        {id : 3, start : 560, end : 620},// starts at 6:20pm and ends at 7:20pm
        {id : 4, start : 600, end : 650}, // starts at 7:10pm pm and ends at 8:10 pm
        {id : 5, start : 630, end : 660} // starts at 7:10pm pm and ends at 8:10 pm
    ]);*/
    /*var processedEvents = layOutDay([
        {id : 1, start : 450,  end : 480},// starts at 9:30 am and ends at 11:30 am
        {id : 2, start : 470, end : 500},// starts at 6:00 pm and ends at 7:00pm
        {id : 3, start : 480, end : 510},// starts at 6:20pm and ends at 7:20pm
        {id : 4, start : 480, end : 510}, // starts at 7:10pm pm and ends at 8:10 pm
        {id : 6, start : 495, end : 525} // starts at 7:10pm pm and ends at 8:10 pm
    ]);*/

    //two more test cases -- uncomment the following to test it.
   /* var processedEvents = layOutDay([
        {id : 1, start : 30,  end : 150},// starts at 9:30 am and ends at 11:30 am
        {id : 2, start : 540, end : 600},// starts at 6:00 pm and ends at 7:00pm
        {id : 3, start : 560, end : 620},// starts at 6:20pm and ends at 7:20pm
        {id : 4, start : 600, end : 650}, // starts at 7:10pm pm and ends at 8:10 pm
        {id : 6, start : 610, end : 670} // starts at 7:10pm pm and ends at 8:10 pm
    ]);*/
    /*var processedEvents = layOutDay([
        {id : 1, start : 0,  end : 60},// starts at 9:30 am and ends at 11:30 am
        {id : 2, start : 30, end : 150},// starts at 6:00 pm and ends at 7:00pm
        {id : 3, start : 90, end : 180},// starts at 6:00 pm and ends at 7:00pm
        {id : 4, start : 120, end : 180},// starts at 6:20pm and ends at 7:20pm
        {id : 5, start : 240, end : 300}, // starts at 7:10pm pm and ends at 8:10 pm
        {id : 6, start : 270, end : 360}, // starts at 7:10pm pm and ends at 8:10 pm
        {id : 8, start : 300, end : 360}, // starts at 7:10pm pm and ends at 8:10 pm
        {id : 7, start : 300, end : 420} // starts at 7:10pm pm and ends at 8:10 pm
    ]);*/

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
