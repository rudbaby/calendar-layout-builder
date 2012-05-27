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
    for (i = 0; i < eventsLength; i++) {
        event = events[i];
        if (event.start < 0 || event.start > 840) {
            throw new Error('event time should be in between 0 to 840 ( 9AM to 9PM)');
        }
        if (event.id != idx + 1) {
            throw new Error('ids are not in sequence');
        }
        itree.add(event.start, event.end - 1, idx++);
    }
    for (i = 0; i < eventsLength; i++) {
        event = events[i];
        if (!event.position) {
            overlappedEvents = itree.search(event.start, event.end - 1);
            event.existingOverlappedEvents = overlappedEvents;
            //console.info(event.id, event.start, event.end,overlappedEvents.length,overlappedEvents);
            var totalDivisions = overlappedEvents.length;
            if (totalDivisions == 1) {
                event.position = {top : event.start, left:0,width:layoutWidth};
                continue;
            }

            var divisionsRequired = 0;
            for (oc = 0; oc < overlappedEvents.length; oc++) {
                overlappedEvent = events[overlappedEvents[oc].id];
                divisionsRequired++;
                for (poic = oc - 1; poic >= 0; poic--) {
                    var prevEvent = events[overlappedEvents[poic].id];
                    if (prevEvent.end <= overlappedEvent.start) {
                        divisionsRequired--;
                    }
                    /* else if (overlappedEvents.length > totalDivisions && prevEvent.start == overlappedEvent.start && prevEvent.end == overlappedEvent.end) {
                     divisionsRequired++;
                     }*/
                }
                overlappedEvent.slot = divisionsRequired;
            }
            totalDivisions = divisionsRequired;
            console.info("divisionsRequired", divisionsRequired, "overlappedEvents", events);
            width = layoutWidth / totalDivisions;
            buckets = [];
            for (bc = 0; bc < overlappedEvents.length; bc++)buckets[bc] = 0;
            for (oc = 0; oc < overlappedEvents.length; oc++) {
                overlappedEvent = events[overlappedEvents[oc].id];
                if (!overlappedEvent.position) {
                    var needSlot = true, newDivision = 1, newWidth = width, positionExists=0;
                    for (poic = oc - 1; poic >= 0; poic--) {
                        var prevEvent = events[overlappedEvents[poic].id];
                        if (prevEvent.end <= overlappedEvent.start) {
                            left = prevEvent.position.left;
                            needSlot = false;
                            console.info("no need for new slot");
                            for (var ac = 0; ac < events.length; ac++) {
                                var slotEvent = events[ac];
                                if (slotEvent.id != overlappedEvent.id && slotEvent.start == overlappedEvent.start && slotEvent.end == overlappedEvent.end) {
                                    newDivision++;
                                    if(slotEvent.position){
                                        positionExists++;
                                    }
                                }
                            }
                            newWidth = width / newDivision;
                            if (newWidth < width) {
                                left += newWidth*positionExists;
                            }
                            break;
                        }
                    }
                    if (needSlot) {
                        nextSlot = 0;
                        while (buckets[nextSlot] != 0 && nextSlot < buckets.length) nextSlot++;
                        buckets[nextSlot] = 1;
                        console.info("need slot buckets", buckets);
                        left = width * nextSlot;
                    }
                    overlappedEvent.position = {top : event.start, left:left,width:newWidth < width ? newWidth : width};
                } else {
                    if (overlappedEvent.existingOverlappedEvents) {
                        k = 0;
                        overlappedEvent.existingOverlappedEvents.forEach(function(evt) {
                            existingEvent = events[evt.id];
                            existingEvent.position.width = width;
                            existingEvent.position.left = width * k;
                            if (overlappedEvent.id == existingEvent.id) {
                                buckets[k] = 1;
                                //console.info("inner buckets", buckets);
                            }
                            k = k + 1;
                        });
                    }

                }
                overlappedEvent.existingOverlappedEvents = overlappedEvents;
            }
        }
    }
    return events;
}
function renderLayout(processedEvents) {
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
}
$(document).ready(function() {

    $(".testcase li").bind("click", function(evt) {
        var target = $(evt.target);
        $(".event-dashboard").html("");
        renderLayout(layOutDay(testSample[target.attr("id")]));
    });
    var testSample = [];


    testSample[0] = [
        {id : 1, start : 30,  end : 150},
        {id : 2, start : 540, end : 600},
        {id : 3, start : 560, end : 620},
        {id : 4, start : 600, end : 650}
    ];
    testSample[1] = [
        {id : 1, start : 60, end : 120},
        {id : 2, start : 60,  end : 90},
        {id : 3, start : 90, end : 120},
        {id : 4, start : 600, end : 650},
         {id : 5, start : 630, end : 650}
    ];
    testSample[2] = [
        {id : 1, start : 60, end : 120},
        {id : 2, start : 60,  end : 90},
        {id : 3, start : 90, end : 120},
        {id : 4, start : 90, end : 120},
        {id : 5, start : 600, end : 650},
         {id : 6, start : 630, end : 650}
    ];
    testSample[3] = [
        {id : 1, start : 30,  end : 150},
        {id : 2, start : 540, end : 600},
        {id : 3, start : 560, end : 620},
        {id : 4, start : 600, end : 650},
        {id : 5, start : 630, end : 660}
    ];
    testSample[4] = [
        {id : 1, start : 450,  end : 480},
        {id : 2, start : 470, end : 500},
        {id : 3, start : 480, end : 510},
        {id : 4, start : 480, end : 510},
        {id : 5, start : 495, end : 525}
    ];

    testSample[5] = [
        {id : 1, start : 30,  end : 150},
        {id : 2, start : 540, end : 600},
        {id : 3, start : 560, end : 620},
        {id : 4, start : 600, end : 650},
        {id : 5, start : 610, end : 670}
    ];
    testSample[6] = [
        {id : 1, start : 0,  end : 60},
        {id : 2, start : 30, end : 150},
        {id : 3, start : 90, end : 180},
        {id : 4, start : 120, end : 180},
        {id : 5, start : 240, end : 300},
        {id : 6, start : 270, end : 360},
        {id : 7, start : 300, end : 360},
        {id : 8, start : 300, end : 420}
    ];
    var processedEvents = layOutDay(testSample[0]);
    renderLayout(processedEvents);

});
