/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { createRoot, React } from "@webpack/common";

const dataURL = "https://raw.githubusercontent.com/Blankiiii/bringBackKaomojiPicker-Vencord/main/src/userplugins/bringBackKaomojiPicker/kaomojis.json";

interface KaomojiItem {
    name: string;
    kaomoji: string;
}

interface KaomojiCategory {
    [category: string]: KaomojiItem[];
}

const KAOMOJI_TAB_ID = "vc-kaomoji-picker-tab";
const KAOMOJI_PANEL_ID = "vc-kaomoji-picker-tab-panel";
const CSS_ID = "vc-kaomoji-picker-styles";

let observer: MutationObserver | null = null;
let kaomojiRoot: ReturnType<typeof createRoot> | null = null;
let injectScheduled = false;

function injectStyles() {
    if (document.getElementById(CSS_ID)) return;

    const style = document.createElement("style");
    style.id = CSS_ID;

    style.textContent = `
        .vc-kaomoji-btn {
            border: 1px solid transparent;
            border-radius: var(--radius-sm);
            padding: 10px 8px;
            background: var(--background-mod-normal);
            color: var(--text-default);
            cursor: pointer;
            font-size: 14px;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: background-color .1s ease-in-out, color .1s ease-in-out;
        }

        .vc-kaomoji-btn:hover {
            background-color: var(--background-mod-strong);
        }
    `;

    document.head.appendChild(style);
}

function removeStyles() {
    document.getElementById(CSS_ID)?.remove();
}

function getEditor(): HTMLElement | null {
    const active = document.activeElement;

    if (
        active instanceof HTMLElement &&
        active.matches('[contenteditable="true"]')
    ) {
        return active;
    }

    return document.querySelector(
        'div[role="textbox"][contenteditable="true"]'
    ) as HTMLElement | null;
}

function sendEscape(target: EventTarget = document.activeElement ?? document.body) {
    target.dispatchEvent(
        new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            keyCode: 27,
            which: 27,
            bubbles: true,
            cancelable: true
        })
    );

    target.dispatchEvent(
        new KeyboardEvent("keyup", {
            key: "Escape",
            code: "Escape",
            keyCode: 27,
            which: 27,
            bubbles: true,
            cancelable: true
        })
    );
}

function pasteKaomoji(editor: HTMLElement, kaomoji: string) {
    editor.focus();

    const selection = window.getSelection();
    const range = document.createRange();

    range.selectNodeContents(editor);

    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
    }

    const dt = new DataTransfer();
    dt.setData("text/plain", kaomoji);

    const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: dt,
        bubbles: true,
        cancelable: true
    });

    editor.dispatchEvent(pasteEvent);
}

function KaomojiPanel() {
    const [search, setSearch] = React.useState("");
    const [kaomojis, setKaomojis] = React.useState<KaomojiCategory | null>(null);

    React.useEffect(() => {
        fetch(dataURL)
            .then(res => res.json())
            .then((data: KaomojiCategory) => setKaomojis(data))
            .catch(err => console.error("Failed to fetch kaomojis:", err));
    }, []);

    if (!kaomojis) {
        return <div style={{ padding: "16px", color: "var(--text-muted)" }}>Loading kaomojis...</div>;
    }

    const categories = Object.entries(kaomojis)
        .map(([category, items]) => {
            const filtered = items.filter(item => {
                const query = search.toLowerCase();

                return (
                    !query ||
                    item.name.toLowerCase().includes(query) ||
                    item.kaomoji.toLowerCase().includes(query)
                );
            });

            return [category, filtered] as const;
        })
        .filter(([, items]) => items.length > 0);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden"
            }}
        >
            <div
                className="header_c0e32c"
                style={{
                    margin: "var(--space-0)",
                    flexShrink: 0
                }}
            >
                <div className="container__5a838">
                    <div className="control__5a838">
                        <div className="container__72c38">
                            <div className="wrapper__72c38 container__75098 md__75098 text-md/normal_cf4812 hasLeading__75098">
                                <div className="icon__75098">
                                    <svg
                                        aria-hidden="true"
                                        role="img"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        className="icon__75098"
                                    >
                                        <path
                                            fill="var(--icon-strong)"
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M15.62 17.03a9 9 0 1 1 1.41-1.41l4.68 4.67a1 1 0 0 1-1.42 1.42l-4.67-4.68ZM17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                                        />
                                    </svg>
                                </div>

                                <input
                                    value={search}
                                    onChange={event =>
                                        setSearch(event.currentTarget.value)
                                    }
                                    placeholder="Search"
                                    autoComplete="off"
                                    className="input__75098"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="bodyWrapper_c0e32c scroller_affa7e list_c656ac scrollbarGutterStable_d125d2 thin_d125d2 scrollerBase_d125d2"
                style={{
                    padding: "var(--space-6) var(--space-16) 0 var(--space-16)",
                    overflowY: "auto",
                    flexGrow: 1
                }}
            >
                {categories.map(([category, items]) => (
                    <div
                        key={category}
                        style={{
                            marginBottom: "16px"
                        }}
                    >
                        <div
                            className="header__14245"
                            style={{
                                paddingBottom: "var(--space-8)"
                            }}
                        >
                            {category}
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fill, minmax(110px, 1fr))",
                                gap: "8px"
                            }}
                        >
                            {items.map(item => (
                                <button
                                    type="button"
                                    key={`${category}-${item.name}`}
                                    title={item.name}
                                    className="vc-kaomoji-btn"
                                    onClick={() => {
                                        const editor = getEditor();

                                        if (editor) {
                                            pasteKaomoji(
                                                editor,
                                                item.kaomoji
                                            );

                                            sendEscape(editor);
                                        } else {
                                            navigator.clipboard.writeText(
                                                item.kaomoji
                                            );
                                        }
                                    }}
                                >
                                    {item.kaomoji}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function createKaomojiPanel(container: HTMLElement) {
    kaomojiRoot = createRoot(container);
    kaomojiRoot.render(<KaomojiPanel />);
}

function getNavList(): HTMLElement | null {
    const emojiTab = document.getElementById("emoji-picker-tab");

    if (!emojiTab) return null;

    return emojiTab.closest(
        '[role="tablist"][aria-label="Expression Picker Categories"]'
    ) as HTMLElement | null;
}

function hideKaomojiPanel() {
    const panel = document.getElementById(KAOMOJI_PANEL_ID);

    if (panel) {
        panel.style.display = "none";
    }
}

function showKaomojiPanel() {
    const panel = document.getElementById(KAOMOJI_PANEL_ID);

    if (panel) {
        panel.style.display = "";
    }

    document.querySelectorAll('[role="tabpanel"]').forEach(p => {
        if (p.id !== KAOMOJI_PANEL_ID) {
            (p as HTMLElement).style.display = "none";
        }
    });
}

function syncTabSelectionStates() {
    const nav = getNavList();

    if (!nav) return;

    const sampleTab = nav.querySelector(
        `[role="tab"]:not(#${KAOMOJI_TAB_ID})`
    ) as HTMLElement | null;

    nav.querySelectorAll('[role="tab"]').forEach(element => {
        const tab = element as HTMLElement;
        const isSelected =
            tab.getAttribute("aria-selected") === "true";

        if (isSelected) {
            tab.setAttribute("aria-current", "page");

            if (sampleTab) {
                for (const cls of sampleTab.classList) {
                    if (
                        cls.includes("selected") ||
                        cls.includes("Active")
                    ) {
                        tab.classList.add(cls);
                    }
                }
            }

            tab.classList.add("navButtonActive__08434");
        } else {
            tab.removeAttribute("aria-current");
            tab.classList.remove("navButtonActive__08434");

            if (sampleTab) {
                for (const cls of sampleTab.classList) {
                    if (
                        cls.includes("selected") ||
                        cls.includes("Active")
                    ) {
                        tab.classList.remove(cls);
                    }
                }
            }
        }
    });

    const kaomojiTab = document.getElementById(
        KAOMOJI_TAB_ID
    );

    if (
        kaomojiTab &&
        kaomojiTab.getAttribute("aria-selected") !== "true"
    ) {
        kaomojiTab.classList.remove("navButtonActive__08434");
        kaomojiTab.removeAttribute("aria-current");
    }
}

function handleNativeTabClick(tab: HTMLElement) {
    const nav = getNavList();

    if (!nav) return;

    nav.querySelectorAll('[role="tab"]').forEach(el => {
        el.setAttribute(
            "aria-selected",
            el === tab ? "true" : "false"
        );
    });

    syncTabSelectionStates();
    hideKaomojiPanel();

    const controlsId = tab.getAttribute("aria-controls");

    document.querySelectorAll('[role="tabpanel"]').forEach(p => {
        if (p.id === controlsId) {
            (p as HTMLElement).style.display = "";
        } else if (p.id !== KAOMOJI_PANEL_ID) {
            (p as HTMLElement).style.display = "none";
        }
    });
}

function setActiveTab(selectedTab: HTMLElement) {
    const nav = getNavList();

    if (!nav) return;

    nav.querySelectorAll('[role="tab"]').forEach(element => {
        const current = element as HTMLElement;

        current.setAttribute(
            "aria-selected",
            current === selectedTab ? "true" : "false"
        );
    });

    syncTabSelectionStates();
}

function createKaomojiTab(nav: HTMLElement): HTMLElement {
    const tab = document.createElement("div");
    tab.id = KAOMOJI_TAB_ID;

    const emojiTabRef = nav.querySelector("#emoji-picker-tab");

    if (emojiTabRef) {
        tab.className = emojiTabRef.className;
    } else {
        tab.className = "navButton__08434 navItem__08434";
    }

    tab.classList.remove("navButtonActive__08434");

    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", KAOMOJI_PANEL_ID);
    tab.setAttribute("aria-selected", "false");
    tab.tabIndex = 0;
    tab.textContent = "^▽^";

    tab.addEventListener("click", () => {
        setActiveTab(tab);
        showKaomojiPanel();
    });

    tab.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            tab.click();
        }
    });

    if (emojiTabRef) {
        emojiTabRef.insertAdjacentElement("afterend", tab);
    } else {
        nav.appendChild(tab);
    }

    return tab;
}

function attachNativeTabListeners(nav: HTMLElement) {
    nav.querySelectorAll('[role="tab"]').forEach(tab => {
        if (tab.id === KAOMOJI_TAB_ID) return;

        if (
            tab.getAttribute("data-kaomoji-listener") === "true"
        ) {
            return;
        }

        tab.setAttribute("data-kaomoji-listener", "true");

        tab.addEventListener("click", () => {
            handleNativeTabClick(tab as HTMLElement);
        });
    });
}

function createKaomojiPanelElement(): HTMLElement | null {
    const existing = document.getElementById(KAOMOJI_PANEL_ID);

    if (existing) {
        return existing;
    }

    const emojiPanel = document.getElementById(
        "emoji-picker-tab-panel"
    );

    if (!emojiPanel || !emojiPanel.parentElement) {
        return null;
    }

    const panel = document.createElement("div");

    panel.id = KAOMOJI_PANEL_ID;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute(
        "aria-labelledby",
        KAOMOJI_TAB_ID
    );

    panel.style.position = "absolute";
    panel.style.inset = "48px 0px 0px";
    panel.style.display = "none";

    emojiPanel.parentElement.appendChild(panel);

    createKaomojiPanel(panel);

    return panel;
}

function injectIntoPicker() {
    const nav = getNavList();

    if (!nav) return;

    let tab = document.getElementById(
        KAOMOJI_TAB_ID
    ) as HTMLElement | null;

    if (!tab) {
        tab = createKaomojiTab(nav);
    }

    createKaomojiPanelElement();
    attachNativeTabListeners(nav);

    if (!nav.contains(tab)) {
        const emojiTab = nav.querySelector("#emoji-picker-tab");

        if (emojiTab) {
            emojiTab.insertAdjacentElement("afterend", tab);
        } else {
            nav.appendChild(tab);
        }
    }
}

function scheduleInjection() {
    if (injectScheduled) return;

    injectScheduled = true;

    requestAnimationFrame(() => {
        injectScheduled = false;
        injectIntoPicker();
    });
}

export default definePlugin({
    name: "BringBackKaomojiPicker",

    description:
        "Adds the Kaomoji tab (previously removed by discord) back to Discord's expression picker.",

    authors: [{ name: "literally.blank", id: 1059450131784663120n }],

    start() {
        injectStyles();

        observer = new MutationObserver(() => {
            scheduleInjection();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        injectIntoPicker();
    },

    stop() {
        observer?.disconnect();
        observer = null;

        injectScheduled = false;

        kaomojiRoot?.unmount();
        kaomojiRoot = null;

        removeStyles();

        document.getElementById(KAOMOJI_TAB_ID)?.remove();
        document.getElementById(KAOMOJI_PANEL_ID)?.remove();
    }
});
