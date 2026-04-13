/**
 * Autocomplete Module for Blood on the Clocktower Game Entry
 *
 * Provides inline autocomplete for player names and character roles
 * in the team textareas and storyteller input.
 */

import { CHARACTER_ROLE_TYPES } from './config.js';

// Shared player names list (updated when games are refreshed)
let playerNames = [];

// All autocomplete instances (for updating player names globally)
const instances = [];

// Build role candidates once from config
const roleCandidates = Object.entries(CHARACTER_ROLE_TYPES).map(([key, type]) => ({
    key,
    display: standardizeRoleName(key),
    type
}));

/**
 * Convert a role key to Title_Case display name.
 * e.g., "snake_charmer" → "Snake_Charmer"
 */
function standardizeRoleName(role) {
    if (!role) return '';
    return role.split(/([_\-])/).map((seg, i) => {
        if (seg === '_' || seg === '-') return seg;
        if (!seg) return seg;
        return seg[0].toUpperCase() + seg.slice(1).toLowerCase();
    }).join('');
}

/**
 * Update the shared player names list.
 * Called when new games are added and data is refreshed.
 */
export function updatePlayerNames(names) {
    playerNames = names;
    for (const inst of instances) {
        inst.playerNames = names;
    }
}

/**
 * Initialize autocomplete on a target element.
 * @param {HTMLTextAreaElement|HTMLInputElement} element
 * @param {Object} options
 * @param {string[]} options.playerNames - Known player names
 * @param {boolean} options.multiline - true for textareas, false for single inputs
 */
export function initAutocomplete(element, options) {
    const inst = new AutocompleteInstance(element, options);
    instances.push(inst);
    return inst;
}

class AutocompleteInstance {
    constructor(element, options) {
        this.element = element;
        this.multiline = options.multiline !== false;
        this.commaSeparated = options.commaSeparated || false;
        this.customCandidates = options.candidates || null;
        this.playerNames = options.playerNames || [];
        this.suggestions = [];
        this.selectedIndex = -1;
        this.isOpen = false;

        // Create wrapper and dropdown
        this.wrapper = this.createWrapper();
        this.dropdown = this.createDropdown();

        // Bind events
        this.onInput = this.handleInput.bind(this);
        this.onKeyDown = this.handleKeyDown.bind(this);
        this.onBlur = this.handleBlur.bind(this);
        this.onScroll = this.hide.bind(this);

        element.addEventListener('input', this.onInput);
        element.addEventListener('keydown', this.onKeyDown);
        element.addEventListener('blur', this.onBlur);
        if (this.multiline) {
            element.addEventListener('scroll', this.onScroll);
        }
    }

    createWrapper() {
        const wrapper = document.createElement('div');
        wrapper.className = 'autocomplete-wrapper';
        this.element.parentNode.insertBefore(wrapper, this.element);
        wrapper.appendChild(this.element);
        return wrapper;
    }

    createDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        this.wrapper.appendChild(dropdown);
        return dropdown;
    }

    /**
     * Analyze the current cursor position to determine what to autocomplete.
     */
    getContext() {
        const text = this.element.value;
        const cursor = this.element.selectionStart;

        if (this.commaSeparated) {
            // Comma-separated input: find the current segment
            const beforeCursor = text.substring(0, cursor);
            const lastComma = beforeCursor.lastIndexOf(',');
            const segmentStart = lastComma + 1;
            const query = beforeCursor.substring(segmentStart).trim();
            // replaceStart skips whitespace after the comma
            const trimmedStart = segmentStart + (beforeCursor.substring(segmentStart).length - beforeCursor.substring(segmentStart).trimStart().length);
            return {
                type: 'custom',
                query,
                replaceStart: trimmedStart,
                replaceEnd: cursor
            };
        }

        if (!this.multiline) {
            // Single-line input: always autocomplete player names
            const word = text.substring(0, cursor);
            return {
                type: 'player',
                query: word,
                replaceStart: 0,
                replaceEnd: cursor
            };
        }

        // Find the current line
        const lineStart = text.lastIndexOf('\n', cursor - 1) + 1;
        const lineText = text.substring(lineStart, cursor);

        // Determine which word we're on
        const spaceIndex = lineText.indexOf(' ');

        if (spaceIndex === -1) {
            // No space yet - typing the player name (first word)
            return {
                type: 'player',
                query: lineText,
                replaceStart: lineStart,
                replaceEnd: cursor
            };
        }

        // After the first space - typing the role (second word)
        const roleStart = lineStart + spaceIndex + 1;
        const roleText = text.substring(roleStart, cursor);

        // Handle compound roles with +
        const lastPlus = roleText.lastIndexOf('+');
        if (lastPlus !== -1) {
            return {
                type: 'role',
                query: roleText.substring(lastPlus + 1),
                replaceStart: roleStart + lastPlus + 1,
                replaceEnd: cursor,
                isCompound: true
            };
        }

        // Check if there's a second space (team hint area) - no autocomplete
        const afterFirstSpace = lineText.substring(spaceIndex + 1);
        if (afterFirstSpace.includes(' ')) {
            return null; // In team hint area, no suggestions
        }

        return {
            type: 'role',
            query: roleText,
            replaceStart: roleStart,
            replaceEnd: cursor
        };
    }

    /**
     * Filter candidates by query with scoring.
     */
    filterCandidates(query, candidates, maxResults = 8) {
        if (!query || query.length === 0) return [];

        const lower = query.toLowerCase();

        const scored = [];
        for (const candidate of candidates) {
            const searchStr = typeof candidate === 'string' ? candidate : candidate.display;
            const searchLower = searchStr.toLowerCase();

            // Exact prefix match - highest priority
            if (searchLower.startsWith(lower)) {
                scored.push({ item: candidate, score: 200 - searchLower.length });
                continue;
            }

            // Match after underscore/hyphen segments (e.g., "charmer" matches "snake_charmer")
            const parts = searchLower.split(/[_\-]/);
            let segmentMatch = false;
            for (let i = 1; i < parts.length; i++) {
                if (parts[i].startsWith(lower)) {
                    scored.push({ item: candidate, score: 100 - searchLower.length });
                    segmentMatch = true;
                    break;
                }
            }
            if (segmentMatch) continue;

            // Substring match - lowest priority
            if (searchLower.includes(lower)) {
                scored.push({ item: candidate, score: 50 - searchLower.length });
            }
        }

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, maxResults).map(s => s.item);
    }

    handleInput() {
        const ctx = this.getContext();
        if (!ctx || ctx.query.length === 0) {
            this.hide();
            return;
        }

        let filtered;
        if (ctx.type === 'custom') {
            filtered = this.filterCandidates(ctx.query, this.customCandidates || []);
            if (filtered.length === 1 && filtered[0].toLowerCase() === ctx.query.toLowerCase()) {
                this.hide();
                return;
            }
        } else if (ctx.type === 'player') {
            filtered = this.filterCandidates(ctx.query, this.playerNames);
            // Don't show if query exactly matches a candidate
            if (filtered.length === 1 && filtered[0].toLowerCase() === ctx.query.toLowerCase()) {
                this.hide();
                return;
            }
        } else {
            filtered = this.filterCandidates(ctx.query, roleCandidates);
            // Don't show if query exactly matches a candidate
            if (filtered.length === 1 && filtered[0].display.toLowerCase() === ctx.query.toLowerCase()) {
                this.hide();
                return;
            }
        }

        if (filtered.length === 0) {
            this.hide();
            return;
        }

        this.suggestions = filtered;
        this.currentContext = ctx;
        this.selectedIndex = 0;
        this.render();
        this.show();
    }

    handleKeyDown(e) {
        if (!this.isOpen) return;

        switch (e.key) {
            case 'Tab':
                e.preventDefault();
                this.accept(this.selectedIndex >= 0 ? this.selectedIndex : 0);
                break;

            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
                this.updateSelection();
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection();
                break;

            case 'Escape':
                e.preventDefault();
                e.stopPropagation(); // Don't close the modal
                this.hide();
                break;

            case 'Enter':
                if (this.selectedIndex >= 0) {
                    e.preventDefault();
                    this.accept(this.selectedIndex);
                }
                // If nothing selected, let Enter create a newline normally
                break;
        }
    }

    handleBlur() {
        // Delay hide to allow click events on dropdown items to fire
        setTimeout(() => this.hide(), 150);
    }

    /**
     * Accept a suggestion at the given index.
     */
    accept(index) {
        const suggestion = this.suggestions[index];
        if (!suggestion) return;

        const ctx = this.currentContext;
        const text = this.element.value;
        const displayText = typeof suggestion === 'string' ? suggestion : suggestion.display;

        // Replace the current partial word with the suggestion
        const before = text.substring(0, ctx.replaceStart);
        const after = text.substring(ctx.replaceEnd);

        // Use comma+space separator for comma-separated mode, space otherwise
        const separator = this.commaSeparated ? ', ' : ' ';
        const newText = before + displayText + separator + after;
        this.element.value = newText;

        // Set cursor after the inserted text + separator
        const newCursor = ctx.replaceStart + displayText.length + separator.length;
        this.element.setSelectionRange(newCursor, newCursor);

        // Trigger input event so any other listeners are notified
        this.element.dispatchEvent(new Event('input', { bubbles: true }));

        this.hide();
    }

    /**
     * Render the dropdown items.
     */
    render() {
        const ctx = this.currentContext;
        this.dropdown.innerHTML = '';

        for (let i = 0; i < this.suggestions.length; i++) {
            const suggestion = this.suggestions[i];
            const item = document.createElement('div');
            item.className = 'autocomplete-item' + (i === this.selectedIndex ? ' selected' : '');

            if (ctx.type === 'player' || ctx.type === 'custom') {
                const nameSpan = document.createElement('span');
                nameSpan.className = 'ac-name';
                nameSpan.textContent = suggestion;
                item.appendChild(nameSpan);
            } else {
                const nameSpan = document.createElement('span');
                nameSpan.className = 'ac-name';
                nameSpan.textContent = suggestion.display;
                item.appendChild(nameSpan);

                const typeSpan = document.createElement('span');
                typeSpan.className = 'ac-role-type ' + suggestion.type.toLowerCase();
                typeSpan.textContent = suggestion.type;
                item.appendChild(typeSpan);
            }

            item.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent blur from firing
                this.accept(i);
                this.element.focus();
            });

            item.addEventListener('mouseenter', () => {
                this.selectedIndex = i;
                this.updateSelection();
            });

            this.dropdown.appendChild(item);
        }
    }

    updateSelection() {
        const items = this.dropdown.querySelectorAll('.autocomplete-item');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === this.selectedIndex);
        });
    }

    show() {
        this.isOpen = true;
        this.dropdown.classList.add('visible');
    }

    hide() {
        this.isOpen = false;
        this.dropdown.classList.remove('visible');
        this.suggestions = [];
        this.selectedIndex = -1;
    }
}
