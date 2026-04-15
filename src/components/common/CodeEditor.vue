<template>
  <div ref="host" class="code-editor"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { closeBrackets } from '@codemirror/autocomplete'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'html' },
  height: { type: String, default: '420px' }
})
const emit = defineEmits(['update:modelValue'])

const host = ref(null)
let view = null

function makeState(doc) {
  const lang = props.language === 'css' ? css() : html()
  return EditorState.create({
    doc,
    extensions: [
      lineNumbers(),
      history(),
      bracketMatching(),
      closeBrackets(),
      indentOnInput(),
      highlightActiveLine(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
      lang,
      oneDark,
      EditorView.lineWrapping,
      EditorView.updateListener.of((u) => {
        if (u.docChanged) emit('update:modelValue', u.state.doc.toString())
      }),
      EditorView.theme({ '&': { height: props.height, fontSize: '13px' }, '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' } })
    ]
  })
}

onMounted(() => {
  view = new EditorView({ state: makeState(props.modelValue || ''), parent: host.value })
})

watch(() => props.modelValue, (v) => {
  if (!view) return
  if (v !== view.state.doc.toString()) {
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v || '' } })
  }
})

watch(() => props.language, () => {
  if (!view) return
  const current = view.state.doc.toString()
  view.setState(makeState(current))
})

onBeforeUnmount(() => { view?.destroy() })
</script>

<style scoped>
.code-editor { border: 1px solid var(--gray-200, #e5e7eb); border-radius: 10px; overflow: hidden; }
.code-editor :deep(.cm-editor) { outline: none; }
.code-editor :deep(.cm-editor.cm-focused) { outline: none; }
</style>
