/// <reference path="./js/webcc.d.ts" />

function setProperty(data) {
    console.log("[CWC] Property geändert: " + data.key);
    setPropertyPiechart(data);
}

WebCC.start(
    function(result) {
        if (result) {
            console.log("[CWC] WebCC gestartet");
            initPiechart();
            WebCC.onPropertyChanged.subscribe(setProperty);
        } else {
            console.log("[CWC] WebCC Start fehlgeschlagen");
        }
    },
    controlInit,
    [],
    10000
);
