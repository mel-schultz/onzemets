"use client";
import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Digite aqui..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt("Digite a URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const insertImage = () => {
    const url = prompt("Digite a URL da imagem:");
    if (url) {
      execCommand("insertImage", url);
    }
  };

  return (
    <div className="rich-text-editor">
      <div className="rte-toolbar">
        <div className="rte-toolbar-group">
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("bold")}
            title="Negrito (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("italic")}
            title="Itálico (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("underline")}
            title="Sublinhado (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("strikethrough")}
            title="Riscado"
          >
            <s>S</s>
          </button>
        </div>

        <div className="rte-toolbar-group">
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("insertUnorderedList")}
            title="Lista com marcadores"
          >
            • Lista
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("insertOrderedList")}
            title="Lista numerada"
          >
            1. Lista
          </button>
        </div>

        <div className="rte-toolbar-group">
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("justifyLeft")}
            title="Alinhar à esquerda"
          >
            ⬅
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("justifyCenter")}
            title="Centralizar"
          >
            ↔
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("justifyRight")}
            title="Alinhar à direita"
          >
            ➡
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("justifyFull")}
            title="Justificar"
          >
            ≡
          </button>
        </div>

        <div className="rte-toolbar-group">
          <select
            className="rte-select"
            onChange={(e) => {
              if (e.target.value) {
                execCommand("formatBlock", `<${e.target.value}>`);
                e.target.value = "";
              }
            }}
            title="Estilo de parágrafo"
          >
            <option value="">Estilo</option>
            <option value="h1">Título 1</option>
            <option value="h2">Título 2</option>
            <option value="h3">Título 3</option>
            <option value="p">Parágrafo</option>
          </select>
        </div>

        <div className="rte-toolbar-group">
          <select
            className="rte-select"
            onChange={(e) => {
              if (e.target.value) {
                execCommand("fontSize", e.target.value);
                e.target.value = "";
              }
            }}
            title="Tamanho da fonte"
          >
            <option value="">Tamanho</option>
            <option value="1">Pequeno</option>
            <option value="3">Normal</option>
            <option value="5">Grande</option>
            <option value="7">Muito grande</option>
          </select>
        </div>

        <div className="rte-toolbar-group">
          <input
            type="color"
            className="rte-color"
            onChange={(e) => execCommand("foreColor", e.target.value)}
            title="Cor do texto"
          />
          <input
            type="color"
            className="rte-color"
            onChange={(e) => execCommand("backColor", e.target.value)}
            title="Cor de fundo"
          />
        </div>

        <div className="rte-toolbar-group">
          <button
            type="button"
            className="rte-btn"
            onClick={insertLink}
            title="Inserir link"
          >
            🔗 Link
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={insertImage}
            title="Inserir imagem"
          >
            🖼 Imagem
          </button>
        </div>

        <div className="rte-toolbar-group">
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("undo")}
            title="Desfazer"
          >
            ↶ Desfazer
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => execCommand("redo")}
            title="Refazer"
          >
            ↷ Refazer
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="rte-content"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        data-placeholder={placeholder}
      />
    </div>
  );
}
