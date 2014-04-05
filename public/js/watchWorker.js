$(function () {
    var
        socket = io.connect(),
        nameMap = {};

    socket.on('reload', function () {
        location.reload( true );
    });
    socket.on('stylesheet', function (sheet) {
        if (!nameMap[sheet]) { nameMap[sheet] = sheet; }
        var oldSheet = nameMap[sheet];
        console.log(oldSheet);
        var link = document.createElement('link');
        var appendedSheet = sheet + '?' + Date.now();
        var oldStyle = $('link[href="' + oldSheet + '"]').remove();
        var head = document.getElementsByTagName('head')[0];
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', appendedSheet);
        head.appendChild(link);
        nameMap[sheet] = appendedSheet;
        console.log(nameMap);
        // return { nameMap : nameMap };
    });
});
