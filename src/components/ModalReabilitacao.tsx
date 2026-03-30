"use client";
import React from "react";
import RichTextEditor from "./RichTextEditor";

interface ReabilitacaoData {
  titulo: string;
  data: string;
  medico_responsavel: string;
  fisioterapeuta_responsavel: string;
  pas_inicial: string;
  pad_inicial: string;
  fc_inicial: string;
  peso: string;
  pas_pico: string;
  pad_pico: string;
  fc_pico: string;
  borg_maximo: string;
  distancia: string;
  pas_5min_recuperacao: string;
  pad_5min_recuperacao: string;
  tempo_total_aerobico: string;
  pas_repouso: string;
  pad_repouso: string;
  fc_media: string;
  descricao_treino_aerobico: string;
  tempo_total_muscular: string;
  descricao_treino_muscular: string;
  obs_clinicas: string;
  pas_final: string;
  pad_final: string;
  fc_final: string;
}

interface ModalReabilitacaoProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ReabilitacaoData) => void;
  initialData?: Partial<ReabilitacaoData>;
  isEditing?: boolean;
}

export default function ModalReabilitacao({
  open,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: ModalReabilitacaoProps) {
  const [formData, setFormData] = React.useState<ReabilitacaoData>({
    titulo: initialData?.titulo || "",
    data: initialData?.data || new Date().toISOString().split("T")[0],
    medico_responsavel: initialData?.medico_responsavel || "",
    fisioterapeuta_responsavel: initialData?.fisioterapeuta_responsavel || "",
    pas_inicial: initialData?.pas_inicial || "",
    pad_inicial: initialData?.pad_inicial || "",
    fc_inicial: initialData?.fc_inicial || "",
    peso: initialData?.peso || "",
    pas_pico: initialData?.pas_pico || "",
    pad_pico: initialData?.pad_pico || "",
    fc_pico: initialData?.fc_pico || "",
    borg_maximo: initialData?.borg_maximo || "",
    distancia: initialData?.distancia || "",
    pas_5min_recuperacao: initialData?.pas_5min_recuperacao || "",
    pad_5min_recuperacao: initialData?.pad_5min_recuperacao || "",
    tempo_total_aerobico: initialData?.tempo_total_aerobico || "",
    pas_repouso: initialData?.pas_repouso || "",
    pad_repouso: initialData?.pad_repouso || "",
    fc_media: initialData?.fc_media || "",
    descricao_treino_aerobico: initialData?.descricao_treino_aerobico || "",
    tempo_total_muscular: initialData?.tempo_total_muscular || "",
    descricao_treino_muscular: initialData?.descricao_treino_muscular || "",
    obs_clinicas: initialData?.obs_clinicas || "",
    pas_final: initialData?.pas_final || "",
    pad_final: initialData?.pad_final || "",
    fc_final: initialData?.fc_final || "",
  });

  const handleChange = (field: keyof ReabilitacaoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: "1000px", maxHeight: "90vh", overflowY: "auto" }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">{isEditing ? "Editar Evolução da Reabilitação" : "Nova Evolução da Reabilitação"}</div>

        <div className="form-grid">
          {/* Título e Data */}
          <div className="form-group form-full">
            <label className="form-label">Título *</label>
            <input
              className="form-input"
              value={formData.titulo}
              onChange={e => handleChange("titulo", e.target.value)}
              placeholder="Ex: Evolução 65"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Data *</label>
            <input
              className="form-input"
              type="date"
              value={formData.data}
              onChange={e => handleChange("data", e.target.value)}
            />
          </div>

          {/* Responsáveis */}
          <div className="form-group form-full">
            <label className="form-label">Médico Responsável</label>
            <input
              className="form-input"
              value={formData.medico_responsavel}
              onChange={e => handleChange("medico_responsavel", e.target.value)}
              placeholder="Nome do médico"
            />
          </div>

          <div className="form-group form-full">
            <label className="form-label">Fisioterapeuta Responsável</label>
            <input
              className="form-input"
              value={formData.fisioterapeuta_responsavel}
              onChange={e => handleChange("fisioterapeuta_responsavel", e.target.value)}
              placeholder="Nome do fisioterapeuta"
            />
          </div>

          {/* Dados Iniciais */}
          <div style={{ gridColumn: "1 / -1", marginTop: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "var(--navy)" }}>
              Dados Iniciais
            </h4>
          </div>

          <div className="form-group">
            <label className="form-label">PAS inicial / mmHg</label>
            <input
              className="form-input"
              type="number"
              value={formData.pas_inicial}
              onChange={e => handleChange("pas_inicial", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PAD inicial / mmHg</label>
            <input
              className="form-input"
              type="number"
              value={formData.pad_inicial}
              onChange={e => handleChange("pad_inicial", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">FC inicial / bpm</label>
            <input
              className="form-input"
              type="number"
              value={formData.fc_inicial}
              onChange={e => handleChange("fc_inicial", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Peso / kg</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              value={formData.peso}
              onChange={e => handleChange("peso", e.target.value)}
            />
          </div>

          {/* Treino Aeróbico */}
          <div style={{ gridColumn: "1 / -1", marginTop: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "var(--navy)" }}>
              Treino Aeróbico
            </h4>
          </div>

          <div className="form-group">
            <label className="form-label">PAS pico / mmHg</label>
            <input
              className="form-input"
              type="number"
              value={formData.pas_pico}
              onChange={e => handleChange("pas_pico", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PAD pico / mmHg</label>
            <input
              className="form-input"
              type="number"
              value={formData.pad_pico}
              onChange={e => handleChange("pad_pico", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">FC pico / bpm</label>
            <input
              className="form-input"
              type="number"
              value={formData.fc_pico}
              onChange={e => handleChange("fc_pico", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Borg máximo</label>
            <input
              className="form-input"
              type="number"
              step="0.1"
              value={formData.borg_maximo}
              onChange={e => handleChange("borg_maximo", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Distância / km</label>
            <input
              className="form-input"
              type="number"
              step="0.1"
              value={formData.distancia}
              onChange={e => handleChange("distancia", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PAS 5 min. recuperação / mmHg</label>
            <input
              className="form-input"
              type="number"
              value={formData.pas_5min_recuperacao}
              onChange={e => handleChange("pas_5min_recuperacao", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PAD 5 min. recuperação / mmHg</label>
            <input
              className="form-input"
              type="number"
              value={formData.pad_5min_recuperacao}
              onChange={e => handleChange("pad_5min_recuperacao", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tempo Total Aeróbico / min</label>
            <input
              className="form-input"
              type="number"
              value={formData.tempo_total_aerobico}
              onChange={e => handleChange("tempo_total_aerobico", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PAS repouso / mmHg</label>
            <input
              className="form-input"
              type="number"
              value={formData.pas_repouso}
              onChange={e => handleChange("pas_repouso", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PAD repouso / mmHg</label>
            <input
              className="form-input"
              type="number"
              value={formData.pad_repouso}
              onChange={e => handleChange("pad_repouso", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">FC média / bpm</label>
            <input
              className="form-input"
              type="number"
              value={formData.fc_media}
              onChange={e => handleChange("fc_media", e.target.value)}
            />
          </div>

          <div className="form-group form-full">
            <label className="form-label">Descrição Treino Aeróbico</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={formData.descricao_treino_aerobico}
              onChange={e => handleChange("descricao_treino_aerobico", e.target.value)}
              placeholder="Detalhes do treino aeróbico"
            />
          </div>

          {/* Treino Muscular */}
          <div style={{ gridColumn: "1 / -1", marginTop: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "var(--navy)" }}>
              Treino Muscular
            </h4>
          </div>

          <div className="form-group">
            <label className="form-label">Tempo Total Muscular / min</label>
            <input
              className="form-input"
              type="number"
              value={formData.tempo_total_muscular}
              onChange={e => handleChange("tempo_total_muscular", e.target.value)}
            />
          </div>

          <div className="form-group form-full">
            <label className="form-label">Descrição Treino Muscular</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={formData.descricao_treino_muscular}
              onChange={e => handleChange("descricao_treino_muscular", e.target.value)}
              placeholder="Detalhes do treino muscular"
            />
          </div>

          {/* Observações Clínicas */}
          <div style={{ gridColumn: "1 / -1", marginTop: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "var(--navy)" }}>
              Observações Clínicas
            </h4>
          </div>

          <div className="form-group form-full">
            <label className="form-label">Obs. Clínicas Relevantes</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={formData.obs_clinicas}
              onChange={e => handleChange("obs_clinicas", e.target.value)}
              placeholder="Observações clínicas relevantes"
            />
          </div>

          {/* Dados Finais */}
          <div style={{ gridColumn: "1 / -1", marginTop: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "var(--navy)" }}>
              Dados Finais
            </h4>
          </div>

          <div className="form-group">
            <label className="form-label">PAS final / mmHg</label>
            <input
              className="form-input"
              type="number"
              value={formData.pas_final}
              onChange={e => handleChange("pas_final", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PAD final / mmHg</label>
            <input
              className="form-input"
              type="number"
              value={formData.pad_final}
              onChange={e => handleChange("pad_final", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">FC final / bpm</label>
            <input
              className="form-input"
              type="number"
              value={formData.fc_final}
              onChange={e => handleChange("fc_final", e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-lime" onClick={handleSave}>
            {isEditing ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
