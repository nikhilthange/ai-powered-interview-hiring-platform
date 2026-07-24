import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export default function EmojiPicker({ onEmojiSelect, theme }) {
  return <Picker data={data} onEmojiSelect={onEmojiSelect} theme={theme} />
}
