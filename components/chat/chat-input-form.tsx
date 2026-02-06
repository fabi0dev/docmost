import type React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatInputFormProps {
  input: string
  isLoading: boolean
  isSending: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>
  inputRef?: React.Ref<HTMLInputElement>
}

export function ChatInputForm({
  input,
  isLoading,
  isSending,
  onInputChange,
  onSend,
  onKeyDown,
  inputRef,
}: ChatInputFormProps) {
  return (
    <form
      className="border-t bg-card/90 px-3 py-2"
      onSubmit={(event) => {
        event.preventDefault()
        onSend()
      }}
    >
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="text-sm"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || isSending || isLoading}
        >
          Enviar
        </Button>
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground/80">
        Mensagens salvas no workspace.
      </p>
    </form>
  )
}

