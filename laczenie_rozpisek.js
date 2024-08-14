!(function () {
    "use strict";
    function t(t) {
        (this.maxMemoSize = "number" == typeof char_limit ? char_limit : 6e4),
            (this.msgDurationMs = 1400),
            (this.external = t),
            (this.tabs = t.tabs),
            (this.maxNoTabs = t.max_tabs),
            (this.isMobile = t.mobile),
            (this.create = async function (t) {
                const e = this.splitSchedule(t);
                if (null === e) return void UI.ErrorMessage("Nie uda\u0142o si\u0119 utworzy\u0107 rozpiski.", this.msgDurationMs);
                UI.SuccessMessage("Tworz\u0119 rozpisk\u0119, mo\u017ce to zaj\u0105\u0107 kilka sekund.", this.msgDurationMs);
                const s = this.tabs.length;
                for (let t = 0; t < e.length; t++) {
                    const s = await this.addTab();
                    await this.renameTab(s.id, `Rozpiska [${t + 1}]`), await this.setContent(e[t]);
                }
                this.external.selectTab(this.tabs[s].id), UI.SuccessMessage("Rozpiska zosta\u0142a utworzona. Od\u015bwie\u017cam stron\u0119.", this.msgDurationMs), setTimeout(() => location.reload(), this.msgDurationMs + 600);
            }),
            (this.getSchedule = function (t, e) {
                if ("text" === e)
                    return t
                        .split("\n")
                        .filter((t) => "" !== t)
                        .filter((t) => /^[0-9]+./.test(t) || /^\[b\][0-9]{4}-[0-9]{2}-[0-9]{2}/.test(t) || /Wy\u015blij \w+\[\/url]$/.test(t))
                        .map((t) => t + "\r\n");
            }),
            (this.addTab = function () {
                const t = function (t, e) {
                    if (!t || !t.id) return;
                    if ((this.tabs.push(t) >= this.maxNoTabs && $("#memo-add-tab-button").hide(), 0 === $("div.memo-tab").length)) return void location.reload();
                    const s = $("div.memo-tab").first().clone();
                    this.external.editTabElement(s, t.id, t.title, !0), s.appendTo($("#tab-bar")), $(".memo-tab-button-close").show();
                    const i = $("div.memo_container").first().clone(),
                        o = i.attr("id").substr(5);
                    if (
                        (i.attr("id", "memo_" + t.id),
                        $('input[name="tab_id"]', i).val(t.id),
                        $("tr.show_row > td", i).empty(),
                        $("textarea", i)
                            .val("")
                            .last()
                            .attr("id", "message_" + t.id),
                        $("tr.bbcodes > td", i).empty(),
                        i.insertAfter($("div.memo_container").last()),
                        this.external.Memory.toggle[o])
                    ) {
                        $(".show_row, .edit_link, .edit_row, .submit_row, .bbcodes", $("#memo_" + t.id)).toggle();
                    }
                    this.external.selectTab(t.id), e.resolve(t);
                }.bind(this);
                return $.Deferred((e) => {
                    const i = this.external;
                    this.tabs.length >= this.maxNoTabs && (UI.ErrorMessage(s(_("3531dec6f954a7d15f46b4cf644c5bfe"), this.tabs.length)), e.reject()),
                        TribalWars.post("memo", { ajaxaction: "add_tab" }, {}, (s) => t(s, e)),
                        this.isMobile && i.checkArrow(this.tabs.length);
                });
            }),
            (this.renameTab = function (t, e) {
                const s = function (e) {
                    const s = this.external,
                        i = e.title;
                    i && ((this.tabs[s.findTab(t)].title = i), s.selectTab(t));
                }.bind(this);
                return $.ajax({ url: $("#rename_tab_url").val(), type: "POST", dataType: "json", data: { id: t, newTitle: e } }).done(s);
            }),
            (this.setContent = function (t) {
                const e = this.external.selectedTab;
                $(`#message_${e}`).val(t);
                const s = $(`#memo_${e} form`)[0],
                    i = s.action,
                    o = { memo: s.elements.memo.value, tab_id: s.elements.tab_id.value, h: s.elements.h.value };
                return $.ajax(i, { method: "POST", data: o }).then(
                    ((t, e) => {
                        if ("success" !== e) throw (UI.ErrorMessage("Nie uda\u0142o si\u0119 utworzy\u0107 rozpiski.", this.msgDurationMs), new Error());
                    }).bind(this)
                );
            }),
            (this.splitSchedule = function (t) {
                if (t instanceof Array == !1) return null;
                const e = [];
                let s = "";
                return (
                    t.forEach((t) => {
                        const i = t.join("");
                        s.length + i.length + 2 > this.maxMemoSize && (e.push(s), (s = "")), "" !== s && (s += "\r\n"), (s += i);
                    }),
                    "" !== s && e.push(s),
                    e
                );
            });
    }
    ({
        MSG_DURATION: 1400,
        memo: null,
        baseSettings: { scheduleFormat: "extendedText" },
        settings: {},
        init: function () {
            if (
                (console.log("%cScheduleMerger.js %cv0.9.2", "display: inline-block; padding: 4px 0", "display: inline-block; padding: 4px; background-color: #2151ae; color: white"),
                console.log("Skrypt stworzony przez %cSzary %c(Plemiona: %cAGH Szary%c)", "font-weight: bold", "font-weight: normal", "font-weight: bold", "font-weight: normal"),
                "undefined" != typeof Memo)
            ) {
                (this.memo = new t(Memo)), (this.MSG_DURATION = this.memo.msgDurationMs);
                const e = window.settings;
                e && e.scheduleFormat ? (this.settings.scheduleFormat = e.scheduleFormat) : (this.settings.scheduleFormat = this.baseSettings.scheduleFormat);
                const s = this.getSchedule();
                this.memo.create(s);
            } else UI.ErrorMessage("Nie jeste\u015b w notatkach. Przenosz\u0119."), setTimeout(() => (location.href = `${location.origin}/game.php?screen=memo`), this.MSG_DURATION + 600);
        },
        getSchedule: function () {
            const t = [];
            return (
                document.querySelectorAll(".memo_container").forEach((e) => {
                    const s = this.filterSchedule(e.querySelector('textarea[name="memo"]').value).map((t) => t + "\r\n");
                    const i = 1;

                    for (let e = 0; e < s.length; e += i) {
                        if (e + i - 1 >= s.length) return;
                        t.push(s.slice(e, e + i));
                    }
                }),
                t.sort((a, b) => {
                    const dateA = a[0].match(/dnia (\d{2}\/\d{2}\/\d{4})/)[1];
                    const timeA = a[0].match(/o godzinie (\d{2}:\d{2}:\d{2}-\d{2}:\d{2}:\d{2})/)[1];
                    const dateB = b[0].match(/dnia (\d{2}\/\d{2}\/\d{4})/)[1];
                    const timeB = b[0].match(/o godzinie (\d{2}:\d{2}:\d{2}-\d{2}:\d{2}:\d{2})/)[1];
                
                    const dateTimeA = this.getDateTime(dateA, timeA);
                    const dateTimeB = this.getDateTime(dateB, timeB);

                    return dateTimeA - dateTimeB;
                }),
                t.forEach((entry, index) => {
                    entry[0] = entry[0].replace(/^\d+\./, `${index + 1}.`);
                }),
                t
            );
        },
        getDateTime: function(date, time) {
            const timeString = time.replace("o godzinie ", "");
            const [firstTime, secondTime] = timeString.split("-");
        
            const [day, month, year] = date.split('/').map(Number);
        
            const [firstHours, firstMinutes, firstSeconds] = firstTime.split(':').map(Number);
            const [secondHours, secondMinutes, secondSeconds] = secondTime.split(':').map(Number);
        
            const firstDateTime = new Date(Date.UTC(year, month - 1, day, firstHours, firstMinutes, firstSeconds));
            let secondDateTime = new Date(Date.UTC(year, month - 1, day, secondHours, secondMinutes, secondSeconds));
        
            if (secondDateTime < firstDateTime) {
                secondDateTime.setUTCDate(secondDateTime.getUTCDate() + 1);
            }
        
            return secondDateTime;
        },
        filterSchedule: function (t) {
            return t
            .split("\n")
            .filter((t) => "" !== t)
            .filter((t) => /^[0-9]+\./.test(t) || /^\[b\][0-9]{4}-[0-9]{2}-[0-9]{2}/.test(t) || /^[0-9]{3}\|[0-9]{3}.*?[0-9]{3}\|[0-9]{3}$/.test(t) || /^\[url=.*?\]Wykonaj\*?\[\/url\]$/.test(t));
        },
    }.init());
})();
