import { describe, expect, it, beforeEach, afterAll, vi } from 'vitest';
import { Client } from '@notionhq/client';
import {fetchNotionPages} from "../utils/notion";



describe('import from notion', () => {
    let notion: Client = new Client({ auth: 'foo' });

    beforeEach(() => {
        vi.mock('@notionhq/client', () => {
            return {
                Client: vi.fn().mockImplementation(() => {
                    return {
                        search: vi.fn().mockResolvedValueOnce({
                            has_more: true,
                            next_cursor: 'next-cursor',
                            results: [],
                        }).mockResolvedValueOnce({
                            has_more: false,
                            next_cursor: null,
                            results: [],
                        }),
                    };
                }),
            };
        });
    });

    it('fetches notion pages', async () => {
        const pages = await fetchNotionPages(notion);
        expect(pages).toEqual([]);
    });
});