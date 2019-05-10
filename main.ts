function onOpen() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const entries = [
        {
            functionName: "syncEvents",
            name: "Kanazawa.rb から取得",
        },
    ];
    sheet.addMenu("スクリプト実行", entries);
    // メインメニュー部分に[スクリプト実行]メニューを作成して、
    // 下位項目のメニューを設定している
}

function syncEvents() {
    const topUrl = "https://meetup.kzrb.org";
    const respMainObj = UrlFetchApp.fetch(topUrl);
    const html = respMainObj.getContentText("UTF-8");
    const events = html.match(/<li><a href=".\/([\d]*)\/">([\s\S]*?)<\/a><\/li>/g);

    const cells = events.map((event: any) => ([
        getEventTitle(event),
        getEventContent(event, topUrl),
        getEventDate(event),
        getEventURL(event, topUrl),
    ]));

    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName("一覧");

    sheet.getRange(2, 1, cells.length, 4).setValues(cells);
}

function getEventTitle(event: any) {
    return `meetup ${event.match(/[#][0-9]*/g)}`;
}

function getEventContent(event: any, url: string) {
    // meetup41以前のイベント内容を除外
    const EVENT_CONTENTS_EXCLUSION_BEFORE_MEETUP = 41;
    let eventName = "";
    if (event.match(/\d{1,2}/) > EVENT_CONTENTS_EXCLUSION_BEFORE_MEETUP) {
        let respSubObj = UrlFetchApp.fetch(`${url}${event.match(/\/([\d]*)\//g)}`);
        let contentHtml = respSubObj.getContentText("UTF-8");
        let eventTitle = contentHtml.match(/<p>([\s\S]*?)<\/p>/g);
        eventName = eventTitle[0].replace(/(<p>|<\/p>)/g, "");
    }
    return eventName;
}

function getEventDate(event: any) {
    return event.match(/\d{4}-\d{1,2}-\d{1,2}/g);
}

function getEventURL(event: any, url: string) {
    return `${url}${event.match(/\/([\d]*)\//g)}`;
}
