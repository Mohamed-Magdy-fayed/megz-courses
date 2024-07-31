import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useState, useEffect, ChangeEvent, useRef, useCallback, TextareaHTMLAttributes, Dispatch, SetStateAction } from 'react';

type MentionTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    value: string;
    setValue: (value: string) => void
    mentions: Suggestion[]
    setMentions: Dispatch<SetStateAction<Suggestion[]>>
}

export type Suggestion = { label: string, value: string }

const MentionTextarea: React.FC<MentionTextareaProps> = ({ value, setValue, className, mentions, setMentions, ...rest }) => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showPopover, setShowPopover] = useState(false);
    const [currentText, setCurrentText] = useState('');
    const [caretPosition, setCaretPosition] = useState(0);

    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    const filterUsers = api.users.queryUsers.useMutation()

    const fetchSuggestions = useCallback((query: string) => {
        filterUsers.mutate({ userName: query }, {
            onSuccess: ({ users }) => {
                setSuggestions(users.map(u => ({
                    label: u.name,
                    value: u.id,
                })))
            }
        })
    }, [])

    useEffect(() => {
        if (currentText.startsWith('@')) {
            const query = currentText.slice(1);
            if (query.length > 0) {
                fetchSuggestions(query);
                setShowPopover(true);
            } else {
                setShowPopover(false);
            }
        } else {
            setShowPopover(false);
        }
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [currentText]);

    const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${e.currentTarget.scrollHeight}px`;
        }

        const newValue = e.target.value;
        const currentMentions = newValue.match(/@\w+/g) || [] as string[];
        const mentionedUsers = mentions
        const removedMentions = mentionedUsers.filter(
            ({ label }) => !currentMentions.some((firstName) => firstName.split("@")[1] === (label.split(" ")[0] || label))
        );

        if (removedMentions.length > 0) {
            const updatedMentions = mentionedUsers.filter((mentionedName) => !removedMentions.some((removedUser) => removedUser.value === mentionedName.value));
            setMentions(updatedMentions);
        }

        setValue(newValue);
        const textBeforeCaret = newValue.substring(0, e.target.selectionStart);
        const atSignIndex = textBeforeCaret.lastIndexOf('@');
        const textAfterAt = textBeforeCaret.substring(atSignIndex);
        if (atSignIndex !== -1 && !textAfterAt.includes(" ")) {
            setCurrentText(textAfterAt);
            setCaretPosition(atSignIndex);
        } else {
            setCurrentText('');
        }
        setTimeout(() => e.target.focus(), 10)
    };

    const handleSelectSuggestion = (suggestion: Suggestion) => {
        const beforeCaret = value.substring(0, caretPosition);
        const afterCaret = value.substring(caretPosition + currentText.length);

        setValue(`${beforeCaret}@${suggestion.label}${afterCaret}`);
        setMentions([...mentions, suggestion]);
        setShowPopover(false);
        setCurrentText('');
        if (textAreaRef.current) textAreaRef.current.focus()
    };

    return (
        <Popover
            open={showPopover}
            onOpenChange={(val) => setShowPopover(val)}
        >
            <PopoverTrigger asChild onClick={(e) => e.preventDefault()}>
                <textarea
                    ref={textAreaRef}
                    value={value}
                    onChange={handleTextareaChange}
                    className={cn(
                        "w-full resize-none overflow-hidden h-fit flex rounded-md border border-primary/40 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        className,
                    )}
                    {...rest}
                />
            </PopoverTrigger>
            <PopoverContent className='absolute top-full left-full'>
                <ScrollArea className="h-[18rem]">
                    {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                            <div
                                key={index + suggestion.value}
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className='p-2 cursor-pointer border-b hover:border-primary hover:text-primary'
                            >
                                {suggestion.label}
                            </div>
                        ))
                    ) : (
                        <div className='p-2'>No results found</div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover >
    );
};

export default MentionTextarea;
