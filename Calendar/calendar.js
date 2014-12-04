var $element = $(".calendar");
var calendarWidth = $element.width();
var calendarHeight = 0; // this will be calculated
var viewMode = 'week'; // could be day, week or month
var showOnlyBusinessDays = true;
var daysPerWeekToShow = showOnlyBusinessDays ? 5 : 7;
var minDayWidth = 180;
var stackDays = false; // true if the days need to be stacked
var dayHeight = 0;
var dayWidth = 0;
var numberOfRows = 0;

function initializeDimensions() {
    // set the day height based on view mode
    switch(viewMode) {
        case 'day':
            dayHeight = 400;
            break;
        case 'week':
            dayHeight = 200;
            break;
        case 'month':
            dayHeight = 150;
            break;
    }

    // set the day width based on view mode
    dayWidth = Math.floor(calendarWidth/daysPerWeekToShow);
    switch(viewMode) {
        case 'day':
            dayWidth = calendarWidth;
            break;
        case 'week':
        case 'month':
            dayWidth = Math.floor(calendarWidth/daysPerWeekToShow);
            break;
    }
    // check to see if the calulated day width is less then the min day width
    if(dayWidth < minDayWidth) {
        // if a day will not fit, then simply make it the width of the 
        // calendar.  We will stack days if they are smaller than the min width
        dayWidth = calendarWidth;
        stackDays = true;
    }

    // set the numberOfRows based on view mode
    switch(viewMode) {
        case 'day':
            numberOfRows = 1;
            break;
        case 'week':
            numberOfRows = stackDays ? daysPerWeekToShow : 1;
            break;
        case 'month':
            // TODO: we need to better calculate this
            numberOfRows = stackDays ? daysPerWeekToShow * 6: 6;
            break;
    }

    // calculate the calendar height
    calendarHeight = dayHeight * numberOfRows;
}

function updateCalendarDimensions() {
    initializeDimensions();
    $element.innerHeight(calendarHeight);
}

function resize() {
    updateCalendarDimensions();    
}

window.onresize = resize;
updateCalendarDimensions();
