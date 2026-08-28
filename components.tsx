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
import { IconComponent } from "@utils/types";
import { ComponentDispatch, ExpressionPickerStore, React, ScrollerThin, TextInput, useMemo, useState } from "@webpack/common";

import kaomojiData from "./kaomojis.json";
import { KaomojiCategories, KaomojiItem } from "./types";

export function insertKaomoji(text: string) {
    ComponentDispatch.dispatch("INSERT_TEXT", {
        plainText: text,
        rawText: text
    });
}

export const KaomojiIcon: IconComponent = ({
    height = 20,
    width = 20,
    className,
}) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        className={className}
        style={{ transform: "scale(1.2)" }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M6.5 5.5C4.5 8.7 4.5 15.3 6.5 18.5" />
        <path d="M17.5 5.5C19.5 8.7 19.5 15.3 17.5 18.5" />
        <path d="M9 10.8L10.6 9.2L12 10.8" />
        <path d="M12 10.8L13.4 9.2L15 10.8" />
        <path d="M9.3 14.2Q12 16.8 14.7 14.2" />
    </svg>
);

export const KaomojiPickerButton: ChatBarButtonFactory = ({ isMainChat }) => {
    if (!isMainChat) return null;

    return (
        <ChatBarButton
            tooltip="Open Kaomoji Picker"
            onClick={() => {
                // TODO
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

        const items: { category: string; item: KaomojiItem }[] = [];

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
