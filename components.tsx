/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChatBarButton, ChatBarButtonFactory } from "@api/ChatButtons";
import { Button } from "@components/Button";
import { Flex } from "@components/Flex";
import { Grid } from "@components/Grid";
import { Paragraph } from "@components/Paragraph";
import { getCurrentChannel } from "@utils/discord";
import { IconComponent } from "@utils/types";
import { ComponentDispatch, ExpressionPickerStore, React, ScrollerThin, TextInput, useMemo, useState } from "@webpack/common";

import kaomojiData from "./kaomojis.json";
import { ExpressionPickerView, KaomojiCategories, KaomojiItem } from "./types";

export function insertKaomoji(text: string) {
    ComponentDispatch.dispatch("INSERT_TEXT", {
        plainText: text,
        rawText: text
    });
}

export const KaomojiIcon: IconComponent = ({
    height = 24,
    width = 24,
    className,
}) => (
    <svg
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={className}
        style={{ transform: "scale(1.2)" }}
        fill="var(--icon-default)"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M6.5 17q-.65 0-1.075-.425T5 15.5q0-.625.425-1.062T6.5 14q.625 0 1.063.438T8 15.5q0 .65-.437 1.075T6.5 17m0-7q-.65 0-1.075-.425T5 8.5q0-.625.425-1.062T6.5 7q.625 0 1.063.438T8 8.5q0 .65-.437 1.075T6.5 10m4.5 3q-.425 0-.712-.288T10 12t.288-.712T11 11h2q.425 0 .713.288T14 12t-.288.713T13 13zm6-1q0-1.35-.363-2.6t-1.062-2.3q-.225-.35-.2-.775t.35-.7t.725-.213t.65.413q.9 1.325 1.4 2.887T19 12q0 1.4-.337 2.675t-.938 2.425q-.2.375-.6.475t-.75-.125t-.437-.637t.112-.788q.45-.925.7-1.925T17 12" />
    </svg>
);

export const KaomojiPickerButton: ChatBarButtonFactory = ({ isMainChat, type }) => {
    if (!isMainChat || !type) return null;

    return (
        <ChatBarButton
            tooltip="Open Kaomoji Picker"
            onClick={() => {
                ExpressionPickerStore.openExpressionPicker(ExpressionPickerView.KAOMOJI, type, getCurrentChannel()?.id.toString());
            }}
        >
            <KaomojiIcon />
        </ChatBarButton>
    );
};

export function KaomojiPicker({
    onSelect,
}: {
    onSelect?: (kaomoji: string) => void;
}) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");

    const categories = useMemo(() => {
        return Object.keys(kaomojiData as KaomojiCategories);
    }, []);

    const filtered = useMemo(() => {
        const query = search.toLowerCase().trim();
        const data = kaomojiData as KaomojiCategories;

        const items: { category: string; item: KaomojiItem; }[] = [];

        Object.entries(data).forEach(([category, list]) => {
            if (activeCategory !== "all" && activeCategory !== category) return;

            list.forEach(item => {
                if (
                    !query ||
                    item.name.toLowerCase().includes(query) ||
                    item.kaomoji.includes(query)
                ) {
                    items.push({ category, item });
                }
            });
        });

        return items;
    }, [search, activeCategory]);

    const scrollerRef = React.useRef<any>(null);
    React.useEffect(() => {
        const scrollerNode = scrollerRef.current?.getScrollerNode?.();
        if (scrollerNode) {
            scrollerNode.scrollTop = 0;
        }
    }, [filtered]);

    const handleSelect = (kaomoji: string) => {
        insertKaomoji(kaomoji);
        ExpressionPickerStore.closeExpressionPicker();
        onSelect?.(kaomoji);
    };

    return (
        <Flex
            flexDirection="column"
            gap="10px"
            style={{
                width: "100%",
                height: "100%",
                minWidth: 0,
                minHeight: 400,
                maxWidth: "100%",
                padding: "12px",
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            <Flex
                style={{
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    flexShrink: 0,
                }}
            >
                <TextInput
                    placeholder="Search Kaomoji..."
                    value={search}
                    onChange={setSearch}
                    autoFocus
                    style={{
                        width: "100%",
                        minWidth: 0,
                        maxWidth: "100%",
                        boxSizing: "border-box",
                    }}
                />
            </Flex>

            <Flex
                gap="6px"
                flexWrap="wrap"
                style={{
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    flexShrink: 0,
                    overflow: "hidden",
                }}
            >
                <Button
                    size="small"
                    variant={activeCategory === "all" ? "primary" : "secondary"}
                    onClick={() => setActiveCategory("all")}
                >
                    All
                </Button>

                {categories.map(category => (
                    <Button
                        key={category}
                        size="small"
                        variant={activeCategory === category ? "primary" : "secondary"}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </Button>
                ))}
            </Flex>

            <ScrollerThin
                ref={scrollerRef}
                orientation="vertical"
                fade
                style={{
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    minHeight: 0,
                    flex: "1 1 0",
                    overflowX: "hidden",
                }}
            >
                {filtered.length > 0 ? (
                    <Grid
                        columns={1}
                        gap="8px"
                        style={{
                            width: "100%",
                            maxWidth: "100%",
                            minWidth: 0,
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(min(115px, 100%), 1fr))",
                        }}
                    >
                        {filtered.map(({ item }, index) => (
                            <Button
                                key={`${item.name}-${index}`}
                                size="medium"
                                variant="secondary"
                                title={item.name}
                                onClick={() => handleSelect(item.kaomoji)}
                                style={{
                                    minWidth: 0,
                                    maxWidth: "100%",
                                    width: "100%",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {item.kaomoji}
                            </Button>
                        ))}
                    </Grid>
                ) : (
                    <Flex
                        justifyContent="center"
                        alignItems="center"
                        style={{
                            width: "100%",
                            minWidth: 0,
                            minHeight: 80,
                            padding: "16px",
                            boxSizing: "border-box",
                        }}
                    >
                        <Paragraph>
                            No kaomoji meets the search criteria.
                        </Paragraph>
                    </Flex>
                )}
            </ScrollerThin>
        </Flex>
    );
}
