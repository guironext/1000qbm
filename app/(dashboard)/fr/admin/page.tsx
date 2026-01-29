"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Gamepad2,
  BookOpen,
  Trophy,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  Activity,
  Crown,
  Star,
  Target,
  Zap,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { getAllStages } from "@/lib/actions/getAllStages";
import { getAllSections } from "@/lib/actions/getAllSections";
import { getAllJeux } from "@/lib/actions/getAllJeux";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalUsers: number;
  totalStages: number;
  totalSections: number;
  totalGames: number;
  totalQuestions: number;
  totalScores: number;
  averageScore: number;
}

interface Stage {
  id: string;
  title: string;
  niveau: string;
  image: string;
  numOrder: number;
  langue: string;
  descriptions?: { id: string; texte: string }[]; // Add this line
  sections?: {
    id: string;
    title: string;
    image: string;
    niveau: string;
    numOrder: number;
    stageId: string;
  }[];
}

interface Section {
  id: string;
  title: string;
  image: string;
  niveau: string;
  numOrder: number;
  langue?: string; // Add this line
  jeux?: Game[];
}

interface Game {
  id: string;
  image: string | null;
  niveau: string;
  numOrder: number;
}

// Update the Jeu interface
interface Jeu {
  id: string;
  image: string | null;
  niveau: string;
  numOrder: number;
  langue: string;
  stageId: string;
  sectionId: string | null;
  stage?: Stage | null;
  section?: Section | null;
  questions?: Question[]; // Replace any[] with Question[]
}

// Add Question interface if not already defined
interface Question {
  id: string;
  intitule: string;
  orderNum: number;
  langue: string;
  jeuId?: string | null;
  reponses?: Reponse[];
}

// Add Reponse interface after the Question interface
interface Reponse {
  id: string;
  intitule: string;
  langue: string;
  isCorrect: boolean;
  questionId?: string | null;
}

const AdminDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStages: 0,
    totalSections: 0,
    totalGames: 0,
    totalQuestions: 0,
    totalScores: 0,
    averageScore: 0,
  });
  const [stages, setStages] = useState<Stage[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    niveau: "",
    image: "",
    numOrder: 0,
    langue: "FR",
    descriptions: [] as string[], // Change from description to descriptions array
  });
  const [addFormData, setAddFormData] = useState({
    title: "",
    niveau: "",
    image: "",
    numOrder: 0,
    langue: "FR",
    descriptions: [] as string[], // Change from description to descriptions array
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [addSectionFormData, setAddSectionFormData] = useState({
    title: "",
    niveau: "",
    image: "",
    numOrder: 0,
    langue: "FR",
  });
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isEditSectionDialogOpen, setIsEditSectionDialogOpen] = useState(false);
  const [editSectionFormData, setEditSectionFormData] = useState({
    title: "",
    niveau: "",
    image: "",
    numOrder: 0,
    langue: "FR",
    descriptions: [] as string[], // Change from description to descriptions array
  });
  const [jeux, setJeux] = useState<Jeu[]>([]);
  const [isAddJeuDialogOpen, setIsAddJeuDialogOpen] = useState(false);
  const [addJeuFormData, setAddJeuFormData] = useState({
    langue: "FR",
    image: "",
    niveau: "",
    numOrder: 0,
    stageId: "",
    sectionId: "",
  });
  const [selectedJeu, setSelectedJeu] = useState<Jeu | null>(null);
  const [editingJeu, setEditingJeu] = useState<Jeu | null>(null);
  const [isEditJeuDialogOpen, setIsEditJeuDialogOpen] = useState(false);
  const [editJeuFormData, setEditJeuFormData] = useState({
    langue: "FR",
    image: "",
    niveau: "",
    numOrder: 0,
    stageId: "",
    sectionId: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [addQuestionFormData, setAddQuestionFormData] = useState({
    intitule: "",
    langue: "FR",
    orderNum: 0,
    jeuId: "",
    reponses: [] as { intitule: string; isCorrect: boolean; langue: string }[],
  });
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] =
    useState(false);
  const [editQuestionFormData, setEditQuestionFormData] = useState({
    intitule: "",
    langue: "FR",
    orderNum: 0,
    jeuId: "",
    reponses: [] as { intitule: string; isCorrect: boolean; langue: string }[],
  });

  const languageOptions = [
    { value: "FR", label: "Français" },
    { value: "EN", label: "English" },
    { value: "ES", label: "Español" },
    { value: "PT", label: "Português" },
    { value: "DE", label: "Deutsch" },
  ];

  const getJeuNiveau = () => {
    const selectedStage = stages.find(
      (stage) => stage.id === addJeuFormData.stageId,
    );
    const selectedSection = sections.find(
      (section) => section.id === addJeuFormData.sectionId,
    );

    let niveauValue = "";
    if (selectedStage && selectedSection) {
      niveauValue = `${selectedStage.niveau}-${selectedSection.niveau}`;
    } else if (selectedStage) {
      niveauValue = selectedStage.niveau;
    } else if (selectedSection) {
      niveauValue = selectedSection.niveau;
    }

    // Update the form data with the calculated niveau
    if (niveauValue !== addJeuFormData.niveau) {
      setAddJeuFormData({ ...addJeuFormData, niveau: niveauValue });
    }

    return niveauValue;
  };

  const getEditJeuNiveau = () => {
    const selectedStage = stages.find(
      (stage) => stage.id === editJeuFormData.stageId,
    );
    const selectedSection = sections.find(
      (section) => section.id === editJeuFormData.sectionId,
    );

    let niveauValue = "";
    if (selectedStage && selectedSection) {
      niveauValue = `${selectedStage.niveau}-${selectedSection.niveau}`;
    } else if (selectedStage) {
      niveauValue = selectedStage.niveau;
    } else if (selectedSection) {
      niveauValue = selectedSection.niveau;
    }

    // Update the form data with the calculated niveau
    if (niveauValue !== editJeuFormData.niveau) {
      setEditJeuFormData({ ...editJeuFormData, niveau: niveauValue });
    }

    return niveauValue;
  };

  // Add this helper function after the getJeuNiveau function (around line 200)
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "";

    // If it's already a full URL (https), return as is
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // If it's a relative path starting with '/', return as is
    if (imagePath.startsWith("/")) {
      return imagePath;
    }

    // If it's just a filename, prepend the uploads path
    return `/uploads/${imagePath}`;
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stagesData, sectionsData, jeuxData] = await Promise.all([
        getAllStages(),
        getAllSections(),
        getAllJeux(),
      ]);

      setStages(stagesData);
      setSections(sectionsData);
      setJeux(jeuxData);

      const totalGames = jeuxData.length;

      setStats({
        totalUsers: 0,
        totalStages: stagesData.length,
        totalSections: sectionsData.length,
        totalGames,
        totalQuestions: 0,
        totalScores: 0,
        averageScore: 0,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setEditFormData({
      title: stage.title,
      niveau: stage.niveau,
      image: stage.image,
      numOrder: stage.numOrder,
      langue: stage.langue || "FR",
      descriptions: stage.descriptions?.map((p) => p.texte) || [], // Convert descriptions to array
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveStage = async () => {
    if (!editingStage) return;

    try {
      const response = await fetch("/api/stage", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingStage.id,
          ...editFormData,
        }),
      });

      if (response.ok) {
        toast.success("Stage modifié avec succès!");
        await loadDashboardData();
        setIsEditDialogOpen(false);
        setEditingStage(null);
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Erreur inconnue";

        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        } else {
          try {
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        }

        console.error("Failed to update stage:", errorMessage);
        toast.error("Erreur lors de la modification du stage: " + errorMessage);
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error("Erreur lors de la modification du stage");
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce stage ? Cette action supprimera également toutes les sections et jeux associés.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/stage?id=${stageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Stage supprimé avec succès!!");
        await loadDashboardData();
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Erreur inconnue";

        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            errorMessage = error.details || error.error || errorMessage;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        } else {
          try {
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        }

        console.error("Failed to delete stage:", errorMessage);
        toast.error("Erreur lors de la suppression du stage: " + errorMessage);
      }
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast.error("Erreur lors de la suppression du stage");
    }
  };

  const handleAddStage = () => {
    setAddFormData({
      title: "",
      niveau: "",
      image: "",
      numOrder: stages.length + 1,
      langue: "FR",
      descriptions: [],
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveNewStage = async () => {
    try {
      if (!addFormData.title || !addFormData.niveau) {
        toast.error(
          "Veuillez remplir tous les champs obligatoires (titre et niveau)",
        );
        return;
      }

      const response = await fetch("/api/stage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addFormData),
      });

      if (response.ok) {
        toast.success("Stage créé avec succès!");
        await loadDashboardData();
        setIsAddDialogOpen(false);
        setAddFormData({
          title: "",
          niveau: "",
          image: "",
          numOrder: 0,
          langue: "FR",
          descriptions: [],
        });
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Erreur inconnue";

        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        } else {
          try {
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        }

        console.error("Failed to create stage:", errorMessage);
        toast.error("Erreur lors de la création du stage: " + errorMessage);
      }
    } catch (error) {
      console.error("Error creating stage:", error);
      toast.error("Erreur lors de la création du stage");
    }
  };

  const handleImageUpload = async (
    file: File,
    formType: "stage" | "section" = "stage",
  ) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/loadImage", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (formType === "stage") {
          setAddFormData({ ...addFormData, image: result.url });
        } else {
          setAddSectionFormData({ ...addSectionFormData, image: result.url });
        }
        toast.success("Image téléchargée avec succès!");
      } else {
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          toast.error(
            errorData.error || "Erreur lors du téléchargement de l'image",
          );
        } catch {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          toast.error("Erreur lors du téléchargement de l'image");
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleAddSection = () => {
    setAddSectionFormData({
      title: "",
      niveau: "",
      image: "",
      numOrder: sections.length + 1,
      langue: "FR",
    });
    setIsAddSectionDialogOpen(true);
  };

  const handleSaveNewSection = async () => {
    try {
      if (!addSectionFormData.title || !addSectionFormData.niveau) {
        toast.error(
          "Veuillez remplir tous les champs obligatoires (titre et niveau)",
        );
        return;
      }

      const response = await fetch("/api/section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addSectionFormData),
      });

      if (response.ok) {
        await response.json();
        toast.success("Section créée avec succès!");
        await loadDashboardData();
        setIsAddSectionDialogOpen(false);
        setAddSectionFormData({
          title: "",
          niveau: "",
          image: "",
          numOrder: 0,
          langue: "FR",
        });
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Erreur inconnue";

        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        } else {
          try {
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        }

        console.error("Failed to create section:", errorMessage);
        toast.error(
          "Erreur lors de la création de la section: " + errorMessage,
        );
      }
    } catch (error) {
      console.error("Error creating section:", error);
      toast.error("Erreur lors de la création de la section");
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setEditSectionFormData({
      title: section.title,
      niveau: section.niveau,
      image: section.image,
      numOrder: section.numOrder,
      langue: section.langue || "FR",
      descriptions: [],
    });
    setIsEditSectionDialogOpen(true);
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;

    try {
      const response = await fetch("/api/section", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingSection.id,
          ...editSectionFormData,
        }),
      });

      if (response.ok) {
        toast.success("Section modifiée avec succès!");
        await loadDashboardData();
        setIsEditSectionDialogOpen(false);
        setEditingSection(null);
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Erreur inconnue";

        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        } else {
          try {
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        }

        console.error("Failed to update section:", errorMessage);
        toast.error(
          "Erreur lors de la modification de la section: " + errorMessage,
        );
      }
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("Erreur lors de la modification de la section");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cette section ? Cette action supprimera également tous les jeux associés.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/section?id=${sectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Section supprimée avec succès!");
        await loadDashboardData();
      } else {
        console.error("Failed to delete section");
        toast.error("Erreur lors de la suppression de la section");
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Erreur lors de la suppression de la section");
    }
  };

  const handleAddJeu = () => {
    setAddJeuFormData({
      langue: "FR",
      image: "",
      niveau: "",
      numOrder: jeux.length + 1,
      stageId: "",
      sectionId: "",
    });
    setIsAddJeuDialogOpen(true);
  };

  const handleSaveNewJeu = async () => {
    try {
      if (!addJeuFormData.niveau || !addJeuFormData.stageId) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      const response = await fetch("/api/jeu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addJeuFormData),
      });

      if (response.ok) {
        toast.success("Jeu créé avec succès!");
        await loadDashboardData();
        setIsAddJeuDialogOpen(false);
        setAddJeuFormData({
          langue: "FR",
          image: "",
          niveau: "",
          numOrder: 0,
          stageId: "",
          sectionId: "",
        });
      } else {
        const error = await response.json();
        toast.error("Erreur lors de la création du jeu: " + error.error);
      }
    } catch (error) {
      console.error("Error creating jeu:", error);
      toast.error("Erreur lors de la création du jeu");
    }
  };

  // Update the handleJeuImageUpload function (around line 613)
  const handleJeuImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/loadImage", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // Store the full URL path, not just the filename
        setAddJeuFormData({ ...addJeuFormData, image: result.url });
        toast.success("Image téléchargée avec succès!");
      } else {
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          toast.error(
            errorData.error || "Erreur lors du téléchargement de l'image",
          );
        } catch {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          toast.error("Erreur lors du téléchargement de l'image");
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectJeu = async (jeu: Jeu) => {
    setSelectedJeu(jeu);
    try {
      const response = await fetch(`/api/question?jeuId=${jeu.id}`);
      if (response.ok) {
        const questionsData = await response.json();
        setQuestions(questionsData);
      } else {
        console.error("Failed to fetch questions");
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    }
  };

  const handleEditJeu = (jeu: Jeu) => {
    setEditingJeu(jeu);
    setEditJeuFormData({
      langue: jeu.langue,
      image: jeu.image || "",
      niveau: jeu.niveau,
      numOrder: jeu.numOrder,
      stageId: jeu.stageId,
      sectionId: jeu.sectionId || "",
    });
    setIsEditJeuDialogOpen(true);
  };

  const handleSaveJeu = async () => {
    if (!editingJeu) return;

    try {
      // Calculate niveau based on selected stage/section
      const niveauValue = getEditJeuNiveau();

      const response = await fetch("/api/jeu", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingJeu.id,
          langue: editJeuFormData.langue,
          image: editJeuFormData.image || null,
          niveau: niveauValue || editJeuFormData.niveau,
          numOrder: editJeuFormData.numOrder,
          stageId: editJeuFormData.stageId,
          sectionId: editJeuFormData.sectionId || null,
        }),
      });

      if (response.ok) {
        toast.success("Jeu modifié avec succès!");
        await loadDashboardData();
        setIsEditJeuDialogOpen(false);
        setEditingJeu(null);
        // Refresh selected jeu if it was the one being edited
        if (selectedJeu?.id === editingJeu.id) {
          const updatedJeux = await getAllJeux();
          const updatedJeu = updatedJeux.find((j) => j.id === editingJeu.id);
          if (updatedJeu) {
            await handleSelectJeu(updatedJeu);
          }
        }
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Erreur inconnue";

        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        } else {
          try {
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        }

        console.error("Failed to update jeu:", errorMessage);
        toast.error("Erreur lors de la modification du jeu: " + errorMessage);
      }
    } catch (error) {
      console.error("Error updating jeu:", error);
      toast.error("Erreur lors de la modification du jeu");
    }
  };

  const handleDeleteJeu = async (jeuId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce jeu ? Cette action supprimera également toutes les questions associées.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/jeu?id=${jeuId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Jeu supprimé avec succès!");
        await loadDashboardData();
        // Clear selected jeu if it was deleted
        if (selectedJeu?.id === jeuId) {
          setSelectedJeu(null);
          setQuestions([]);
        }
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Erreur inconnue";

        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        } else {
          try {
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        }

        console.error("Failed to delete jeu:", errorMessage);
        toast.error("Erreur lors de la suppression du jeu: " + errorMessage);
      }
    } catch (error) {
      console.error("Error deleting jeu:", error);
      toast.error("Erreur lors de la suppression du jeu");
    }
  };

  const handleEditJeuImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/loadImage", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setEditJeuFormData({ ...editJeuFormData, image: result.url });
        toast.success("Image téléchargée avec succès!");
      } else {
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          toast.error(
            errorData.error || "Erreur lors du téléchargement de l'image",
          );
        } catch {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          toast.error("Erreur lors du téléchargement de l'image");
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!selectedJeu) {
      toast.error("Veuillez sélectionner un jeu d'abord");
      return;
    }

    setAddQuestionFormData({
      intitule: "",
      langue: selectedJeu.langue,
      orderNum: questions.length + 1,
      jeuId: selectedJeu.id,
      reponses: [
        { intitule: "", isCorrect: true, langue: selectedJeu.langue },
        { intitule: "", isCorrect: false, langue: selectedJeu.langue },
      ],
    });
    setIsAddQuestionDialogOpen(true);
  };

  const handleSaveNewQuestion = async () => {
    try {
      if (!addQuestionFormData.intitule || !addQuestionFormData.jeuId) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      const response = await fetch("/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addQuestionFormData),
      });

      if (response.ok) {
        toast.success("Question créée avec succès!");
        // Refresh questions for the selected jeu
        if (selectedJeu) {
          await handleSelectJeu(selectedJeu);
        }
        setIsAddQuestionDialogOpen(false);
        setAddQuestionFormData({
          intitule: "",
          langue: "FR",
          orderNum: 0,
          jeuId: "",
          reponses: [],
        });
      } else {
        const error = await response.json();
        toast.error(
          "Erreur lors de la création de la question: " + error.error,
        );
      }
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Erreur lors de la création de la question");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/question?id=${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Question supprimée avec succès!");
        // Refresh questions for the selected jeu
        if (selectedJeu) {
          await handleSelectJeu(selectedJeu);
        }
      } else {
        console.error("Failed to delete question");
        toast.error("Erreur lors de la suppression de la question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Erreur lors de la suppression de la question");
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setEditQuestionFormData({
      intitule: question.intitule,
      langue: question.langue,
      orderNum: question.orderNum,
      jeuId: question.jeuId || "",
      reponses:
        question.reponses?.map((r) => ({
          intitule: r.intitule,
          isCorrect: r.isCorrect,
          langue: r.langue,
        })) || [],
    });
    setIsEditQuestionDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;

    try {
      if (!editQuestionFormData.intitule || !editQuestionFormData.jeuId) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      const response = await fetch("/api/question", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingQuestion.id,
          intitule: editQuestionFormData.intitule,
          langue: editQuestionFormData.langue,
          orderNum: editQuestionFormData.orderNum,
          jeuId: editQuestionFormData.jeuId,
        }),
      });

      if (response.ok) {
        toast.success("Question modifiée avec succès!");
        // Refresh questions for the selected jeu
        if (selectedJeu) {
          await handleSelectJeu(selectedJeu);
        }
        setIsEditQuestionDialogOpen(false);
        setEditingQuestion(null);
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Erreur inconnue";

        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        } else {
          try {
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        }

        console.error("Failed to update question:", errorMessage);
        toast.error(
          "Erreur lors de la modification de la question: " + errorMessage,
        );
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Erreur lors de la modification de la question");
    }
  };

  const StatCard = ({
    title,
    value,
    description,
    icon,
    trend,
    gradient,
    iconColor,
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
    trend?: string;
    gradient?: string;
    iconColor?: string;
  }) => (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${gradient}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-gray-700">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${iconColor}`}>{icon}</div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        {trend && (
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-orange-600/10 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-200/50">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      Tableau de Bord Admin
                    </h1>
                    <p className="text-lg text-gray-600">
                      Gérez votre application 1000 QBM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Utilisateurs"
            value={stats.totalUsers}
            description="Joueurs inscrits"
            icon={<Users className="h-6 w-6 text-white" />}
            trend="+12% ce mois"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            iconColor="bg-blue-500"
          />
          <StatCard
            title="Stages"
            value={stats.totalStages}
            description="Niveaux disponibles"
            icon={<BookOpen className="h-6 w-6 text-white" />}
            trend="+2 nouveaux"
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            iconColor="bg-emerald-500"
          />
          <StatCard
            title="Sections"
            value={stats.totalSections}
            description="Catégories de jeux"
            icon={<Activity className="h-6 w-6 text-white" />}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            iconColor="bg-purple-500"
          />
          <StatCard
            title="Jeux"
            value={stats.totalGames}
            description="Jeux disponibles"
            icon={<Gamepad2 className="h-6 w-6 text-white" />}
            gradient="bg-gradient-to-br from-pink-500 to-pink-600"
            iconColor="bg-pink-500"
          />
        </div>

        {/* Quick Actions */}
        <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
            <CardTitle className="flex items-center text-white text-xl">
              <Zap className="h-6 w-6 mr-3" />
              Actions Rapides
            </CardTitle>
            <CardDescription className="text-purple-100 mt-2">
              Accès rapide aux fonctionnalités principales
            </CardDescription>
          </div>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Button
                onClick={() => router.push("/fr/admin/users")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-3 hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-700">
                  Gérer les Joueurs
                </span>
              </Button>
              <Button
                onClick={() => router.push("/fr/admin/scores")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-3 hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-yellow-300 hover:bg-yellow-50"
              >
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <span className="font-semibold text-gray-700">
                  Voir les Palmarès
                </span>
              </Button>
              <Button
                onClick={() => router.push("/fr/admin/statistics")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-3 hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-green-300 hover:bg-green-50"
              >
                <div className="p-3 bg-green-100 rounded-full">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <span className="font-semibold text-gray-700">
                  Statistiques
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content Management */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Stages Management */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
              <CardTitle className="flex items-center text-white text-xl">
                <BookOpen className="h-6 w-6 mr-3" />
                Gestion des Stages
              </CardTitle>
              <CardDescription className="text-amber-100 mt-2">
                Gérez les niveaux et étapes de votre application
              </CardDescription>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Total: {stages.length} stages
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
                  onClick={handleAddStage}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-amber-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {stage.image ? (
                          <Image
                            src={getImageUrl(stage.image)}
                            alt={stage.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover ring-2 ring-amber-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-amber-100 ring-2 ring-amber-100 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-amber-600" />
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                          {stage.title}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-amber-100 text-amber-800 border-amber-200"
                        >
                          Niveau {stage.niveau}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStage(stage)}
                        className="hover:bg-amber-50 hover:border-amber-300"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                        onClick={() => handleDeleteStage(stage.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sections Management */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
              <CardTitle className="flex items-center text-white text-xl">
                <Activity className="h-6 w-6 mr-3" />
                Gestion des Sections
              </CardTitle>
              <CardDescription className="text-emerald-100 mt-2">
                Organisez les catégories de jeux par stage
              </CardDescription>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Total: {sections.length} sections
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md"
                  onClick={handleAddSection}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-emerald-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {section.image ? (
                          <Image
                            src={getImageUrl(section.image)}
                            alt={section.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover ring-2 ring-emerald-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-emerald-100 ring-2 ring-emerald-100 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-emerald-600" />
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {section.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200"
                          >
                            Niveau {section.niveau}
                          </Badge>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {section.jeux?.length || 0} jeux
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditSection(section)}
                        className="hover:bg-emerald-50 hover:border-emerald-300"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Management Cards */}
        <div className="grid gap-8 md:grid-cols-1">
          {/* Jeux Management */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
              <CardTitle className="flex items-center text-white text-xl">
                <Gamepad2 className="h-6 w-6 mr-3" />
                Gestion des Jeux
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2">
                Gérez les jeux et leurs configurations
              </CardDescription>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Total: {jeux.length} jeux
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
                  onClick={handleAddJeu}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {jeux.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Gamepad2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun jeu configuré</p>
                  </div>
                ) : (
                  jeux.map((jeu, index) => (
                    <div
                      key={jeu.id}
                      className={`group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer ${selectedJeu?.id === jeu.id ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
                      onClick={() => handleSelectJeu(jeu)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          {jeu.image && (
                            <Image
                              src={getImageUrl(jeu.image)}
                              alt={`Jeu ${jeu.niveau}`}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-lg object-cover ring-2 ring-blue-100"
                            />
                          )}
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            Niveau Jeu = {jeu.stage?.niveau} /{" "}
                            {jeu.section?.niveau || "N/A"}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                            >
                              Niveau {jeu.niveau}
                            </Badge>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {jeu.langue}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {jeu.questions?.length || 0} questions
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedJeu?.id === jeu.id && (
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-500 text-white">
                            Sélectionné
                          </Badge>
                        </div>
                      )}
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditJeu(jeu);
                          }}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJeu(jeu.id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions Management */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
              <CardTitle className="flex items-center text-white text-xl">
                <BookOpen className="h-6 w-6 mr-3" />
                Gestion des Questions
              </CardTitle>
              <CardDescription className="text-purple-100 mt-2">
                {selectedJeu
                  ? `Questions pour: ${selectedJeu.stage?.niveau} / ${selectedJeu.section?.niveau || "N/A"}`
                  : "Sélectionnez un jeu pour gérer ses questions"}
              </CardDescription>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Total: {questions.length} questions
                    {selectedJeu &&
                      ` pour ${selectedJeu.stage?.niveau} / ${selectedJeu.section?.niveau || "N/A"}`}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
                  onClick={handleAddQuestion}
                  disabled={!selectedJeu}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {!selectedJeu ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Sélectionnez un jeu pour voir ses questions</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune question configurée pour ce jeu</p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-purple-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center ring-2 ring-purple-100">
                            <span className="text-purple-600 font-bold text-lg">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {question.intitule}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-purple-100 text-purple-800 border-purple-200"
                            >
                              {question.langue}
                            </Badge>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {question.reponses?.length || 0} réponses
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              Ordre: {question.orderNum}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditQuestion(question);
                          }}
                          className="hover:bg-purple-50 hover:border-purple-300"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Stage Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center text-xl">
                <Edit className="h-5 w-5 mr-2 text-amber-600" />
                Modifier le Stage
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations du stage sélectionné.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Titre
                  </Label>
                  <Input
                    id="title"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      })
                    }
                    className="border-2 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="niveau"
                    className="text-sm font-medium text-gray-700"
                  >
                    Niveau
                  </Label>
                  <Input
                    id="niveau"
                    value={editFormData.niveau}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        niveau: e.target.value,
                      })
                    }
                    className="border-2 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Descriptions (Paragraphes)
                  </Label>
                  <div className="space-y-2">
                    {editFormData.descriptions.map((text, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Textarea
                          value={text}
                          onChange={(e) => {
                            const newDescriptions = [
                              ...editFormData.descriptions,
                            ];
                            newDescriptions[index] = e.target.value;
                            setEditFormData({
                              ...editFormData,
                              descriptions: newDescriptions,
                            });
                          }}
                          className="border-2 focus:border-amber-500 focus:ring-amber-500 min-h-[80px]"
                          placeholder={`Paragraphe ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newDescriptions =
                              editFormData.descriptions.filter(
                                (_, i) => i !== index,
                              );
                            setEditFormData({
                              ...editFormData,
                              descriptions: newDescriptions,
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setEditFormData({
                          ...editFormData,
                          descriptions: [...editFormData.descriptions, ""],
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un paragraphe
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="langue"
                    className="text-sm font-medium text-gray-700"
                  >
                    Langue
                  </Label>
                  <Select
                    value={editFormData.langue}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, langue: value })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="image"
                    className="text-sm font-medium text-gray-700"
                  >
                    Image
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      value={editFormData.image}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          image: e.target.value,
                        })
                      }
                      className="border-2 focus:border-amber-500 focus:ring-amber-500"
                      placeholder="URL de l'image ou téléchargez un fichier"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                            setEditFormData({ ...editFormData, image: "" });
                          }
                        }}
                        className="hidden"
                        id="edit-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("edit-image-upload")?.click()
                        }
                        disabled={isUploading}
                        className="border-2 hover:border-amber-300"
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        {isUploading ? "Upload..." : "Télécharger"}
                      </Button>
                      {editFormData.image && (
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">
                            Image sélectionnée
                          </span>
                        </div>
                      )}
                    </div>
                    {editFormData.image && (
                      <div className="mt-2">
                        <Image
                          src={getImageUrl(editFormData.image)}
                          alt="Preview"
                          width={100}
                          height={100}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-amber-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="numOrder"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ordre
                  </Label>
                  <Input
                    id="numOrder"
                    type="number"
                    value={editFormData.numOrder}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        numOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-2 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0 space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-2"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSaveStage}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
              >
                <Star className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Stage Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center text-xl">
                <Plus className="h-5 w-5 mr-2 text-amber-600" />
                Ajouter un Stage
              </DialogTitle>
              <DialogDescription>
                Créez un nouveau stage pour votre application.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="add-title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Titre
                  </Label>
                  <Input
                    id="add-title"
                    value={addFormData.title}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, title: e.target.value })
                    }
                    className="border-2 focus:border-amber-500 focus:ring-amber-500"
                    placeholder="Nom du stage"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="add-niveau"
                    className="text-sm font-medium text-gray-700"
                  >
                    Niveau
                  </Label>
                  <Input
                    id="add-niveau"
                    value={addFormData.niveau}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, niveau: e.target.value })
                    }
                    className="border-2 focus:border-amber-500 focus:ring-amber-500"
                    placeholder="Niveau du stage"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Descriptions (Paragraphes)
                  </Label>
                  <div className="space-y-2">
                    {addFormData.descriptions.map((text, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Textarea
                          value={text}
                          onChange={(e) => {
                            const newDescriptions = [
                              ...addFormData.descriptions,
                            ];
                            newDescriptions[index] = e.target.value;
                            setAddFormData({
                              ...addFormData,
                              descriptions: newDescriptions,
                            });
                          }}
                          className="border-2 focus:border-amber-500 focus:ring-amber-500 min-h-[80px]"
                          placeholder={`Paragraphe ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newDescriptions =
                              addFormData.descriptions.filter(
                                (_, i) => i !== index,
                              );
                            setAddFormData({
                              ...addFormData,
                              descriptions: newDescriptions,
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setAddFormData({
                          ...addFormData,
                          descriptions: [...addFormData.descriptions, ""],
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un paragraphe
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="add-langue"
                    className="text-sm font-medium text-gray-700"
                  >
                    Langue
                  </Label>
                  <Select
                    value={addFormData.langue}
                    onValueChange={(value) =>
                      setAddFormData({ ...addFormData, langue: value })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="add-image"
                    className="text-sm font-medium text-gray-700"
                  >
                    Image
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="add-image"
                      value={addFormData.image}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          image: e.target.value,
                        })
                      }
                      className="border-2 focus:border-amber-500 focus:ring-amber-500"
                      placeholder="URL de l'image ou téléchargez un fichier"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                        disabled={isUploading}
                        className="border-2 hover:border-amber-300"
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        {isUploading ? "Upload..." : "Télécharger"}
                      </Button>
                      {addFormData.image && (
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">
                            Image sélectionnée
                          </span>
                        </div>
                      )}
                    </div>
                    {addFormData.image && (
                      <div className="mt-2">
                        <Image
                          src={getImageUrl(addFormData.image)}
                          alt="Preview"
                          width={100}
                          height={100}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-amber-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="add-numOrder"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ordre
                  </Label>
                  <Input
                    id="add-numOrder"
                    type="number"
                    value={addFormData.numOrder}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        numOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-2 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0 space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="border-2"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSaveNewStage}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Section Dialog */}
        <Dialog
          open={isAddSectionDialogOpen}
          onOpenChange={setIsAddSectionDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center text-xl">
                <Plus className="h-5 w-5 mr-2 text-emerald-600" />
                Ajouter une Section
              </DialogTitle>
              <DialogDescription>
                Créez une nouvelle section pour un stage.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="section-title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Titre
                  </Label>
                  <Input
                    id="section-title"
                    value={addSectionFormData.title}
                    onChange={(e) =>
                      setAddSectionFormData({
                        ...addSectionFormData,
                        title: e.target.value,
                      })
                    }
                    className="border-2 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Nom de la section"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="section-niveau"
                    className="text-sm font-medium text-gray-700"
                  >
                    Niveau
                  </Label>
                  <Input
                    id="section-niveau"
                    value={addSectionFormData.niveau}
                    onChange={(e) =>
                      setAddSectionFormData({
                        ...addSectionFormData,
                        niveau: e.target.value,
                      })
                    }
                    className="border-2 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Niveau de la section"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="section-langue"
                    className="text-sm font-medium text-gray-700"
                  >
                    Langue
                  </Label>
                  <Select
                    value={addSectionFormData.langue}
                    onValueChange={(value) =>
                      setAddSectionFormData({
                        ...addSectionFormData,
                        langue: value,
                      })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="section-image"
                    className="text-sm font-medium text-gray-700"
                  >
                    Image
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="section-image"
                      value={addSectionFormData.image}
                      onChange={(e) =>
                        setAddSectionFormData({
                          ...addSectionFormData,
                          image: e.target.value,
                        })
                      }
                      className="border-2 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="URL de l'image ou téléchargez un fichier"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, "section");
                          }
                        }}
                        className="hidden"
                        id="section-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById("section-image-upload")
                            ?.click()
                        }
                        disabled={isUploading}
                        className="border-2 hover:border-emerald-300"
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        {isUploading ? "Upload..." : "Télécharger"}
                      </Button>
                      {addSectionFormData.image && (
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">
                            Image sélectionnée
                          </span>
                        </div>
                      )}
                    </div>
                    {addSectionFormData.image && (
                      <div className="mt-2">
                        <Image
                          src={getImageUrl(addSectionFormData.image)}
                          alt="Preview"
                          width={100}
                          height={100}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-emerald-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="section-numOrder"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ordre
                  </Label>
                  <Input
                    id="section-numOrder"
                    type="number"
                    value={addSectionFormData.numOrder}
                    onChange={(e) =>
                      setAddSectionFormData({
                        ...addSectionFormData,
                        numOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-2 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0 space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddSectionDialogOpen(false)}
                className="border-2"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSaveNewSection}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Section Dialog */}
        <Dialog
          open={isEditSectionDialogOpen}
          onOpenChange={setIsEditSectionDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center text-xl">
                <Edit className="h-5 w-5 mr-2 text-emerald-600" />
                Modifier la Section
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations de la section sélectionnée.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-section-title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Titre
                  </Label>
                  <Input
                    id="edit-section-title"
                    value={editSectionFormData.title}
                    onChange={(e) =>
                      setEditSectionFormData({
                        ...editSectionFormData,
                        title: e.target.value,
                      })
                    }
                    className="border-2 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-section-niveau"
                    className="text-sm font-medium text-gray-700"
                  >
                    Niveau
                  </Label>
                  <Input
                    id="edit-section-niveau"
                    value={editSectionFormData.niveau}
                    onChange={(e) =>
                      setEditSectionFormData({
                        ...editSectionFormData,
                        niveau: e.target.value,
                      })
                    }
                    className="border-2 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Descriptions (Paragraphes)
                  </Label>
                  <div className="space-y-2">
                    {editSectionFormData.descriptions.map((text, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Textarea
                          value={text}
                          onChange={(e) => {
                            const newDescriptions = [
                              ...editSectionFormData.descriptions,
                            ];
                            newDescriptions[index] = e.target.value;
                            setEditSectionFormData({
                              ...editSectionFormData,
                              descriptions: newDescriptions,
                            });
                          }}
                          className="border-2 focus:border-emerald-500 focus:ring-emerald-500 min-h-[80px]"
                          placeholder={`Paragraphe ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newDescriptions =
                              editSectionFormData.descriptions.filter(
                                (_, i) => i !== index,
                              );
                            setEditSectionFormData({
                              ...editSectionFormData,
                              descriptions: newDescriptions,
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setEditSectionFormData({
                          ...editSectionFormData,
                          descriptions: [
                            ...editSectionFormData.descriptions,
                            "",
                          ],
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un paragraphe
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-section-langue"
                    className="text-sm font-medium text-gray-700"
                  >
                    Langue
                  </Label>
                  <Select
                    value={editSectionFormData.langue}
                    onValueChange={(value) =>
                      setEditSectionFormData({
                        ...editSectionFormData,
                        langue: value,
                      })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-section-image"
                    className="text-sm font-medium text-gray-700"
                  >
                    Image
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="edit-section-image"
                      value={editSectionFormData.image}
                      onChange={(e) =>
                        setEditSectionFormData({
                          ...editSectionFormData,
                          image: e.target.value,
                        })
                      }
                      className="border-2 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="URL de l'image ou téléchargez un fichier"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, "section");
                            setEditSectionFormData({
                              ...editSectionFormData,
                              image: "",
                            });
                          }
                        }}
                        className="hidden"
                        id="edit-section-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById("edit-section-image-upload")
                            ?.click()
                        }
                        disabled={isUploading}
                        className="border-2 hover:border-emerald-300"
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        {isUploading ? "Upload..." : "Télécharger"}
                      </Button>
                      {editSectionFormData.image && (
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">
                            Image sélectionnée
                          </span>
                        </div>
                      )}
                    </div>
                    {editSectionFormData.image && (
                      <div className="mt-2">
                        <Image
                          src={getImageUrl(editSectionFormData.image)}
                          alt="Preview"
                          width={100}
                          height={100}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-emerald-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-section-numOrder"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ordre
                  </Label>
                  <Input
                    id="edit-section-numOrder"
                    type="number"
                    value={editSectionFormData.numOrder}
                    onChange={(e) =>
                      setEditSectionFormData({
                        ...editSectionFormData,
                        numOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-2 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0 space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditSectionDialogOpen(false)}
                className="border-2"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSaveSection}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md"
              >
                <Star className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Jeu Dialog */}
        <Dialog open={isAddJeuDialogOpen} onOpenChange={setIsAddJeuDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center text-xl">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                Ajouter un Jeu
              </DialogTitle>
              <DialogDescription>
                Créez un nouveau jeu en sélectionnant un stage et une section.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="jeu-stage"
                    className="text-sm font-medium text-gray-700"
                  >
                    Stage *
                  </Label>
                  <Select
                    value={addJeuFormData.stageId}
                    onValueChange={(value) =>
                      setAddJeuFormData({ ...addJeuFormData, stageId: value })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionner un stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          Stage {stage.niveau} - {stage.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="jeu-section"
                    className="text-sm font-medium text-gray-700"
                  >
                    Section
                  </Label>
                  <Select
                    value={addJeuFormData.sectionId || undefined}
                    onValueChange={(value) =>
                      setAddJeuFormData({
                        ...addJeuFormData,
                        sectionId: value || "",
                      })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionner une section (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          Section {section.niveau} - {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="jeu-niveau"
                    className="text-sm font-medium text-gray-700"
                  >
                    Niveau *
                  </Label>
                  <Input
                    id="jeu-niveau"
                    value={getJeuNiveau()}
                    className="border-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Niveau du jeu"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="jeu-langue"
                    className="text-sm font-medium text-gray-700"
                  >
                    Langue
                  </Label>
                  <Select
                    value={addJeuFormData.langue}
                    onValueChange={(value) =>
                      setAddJeuFormData({ ...addJeuFormData, langue: value })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="jeu-image"
                    className="text-sm font-medium text-gray-700"
                  >
                    Image
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="jeu-image"
                      value={addJeuFormData.image}
                      onChange={(e) =>
                        setAddJeuFormData({
                          ...addJeuFormData,
                          image: e.target.value,
                        })
                      }
                      className="border-2 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="URL de l'image ou téléchargez un fichier"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleJeuImageUpload(file);
                          }
                        }}
                        className="hidden"
                        id="jeu-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("jeu-image-upload")?.click()
                        }
                        disabled={isUploading}
                        className="border-2 hover:border-blue-300"
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        {isUploading ? "Upload..." : "Télécharger"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="jeu-numOrder"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ordre
                  </Label>
                  <Input
                    id="jeu-numOrder"
                    type="number"
                    value={addJeuFormData.numOrder}
                    onChange={(e) =>
                      setAddJeuFormData({
                        ...addJeuFormData,
                        numOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0 space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddJeuDialogOpen(false)}
                className="border-2"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSaveNewJeu}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Jeu Dialog */}
        <Dialog
          open={isEditJeuDialogOpen}
          onOpenChange={setIsEditJeuDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center text-xl">
                <Edit className="h-5 w-5 mr-2 text-blue-600" />
                Modifier le Jeu
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations du jeu sélectionné.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-jeu-stage"
                    className="text-sm font-medium text-gray-700"
                  >
                    Stage *
                  </Label>
                  <Select
                    value={editJeuFormData.stageId}
                    onValueChange={(value) =>
                      setEditJeuFormData({ ...editJeuFormData, stageId: value })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionner un stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          Stage {stage.niveau} - {stage.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-jeu-section"
                    className="text-sm font-medium text-gray-700"
                  >
                    Section
                  </Label>
                  <Select
                    value={editJeuFormData.sectionId || undefined}
                    onValueChange={(value) =>
                      setEditJeuFormData({
                        ...editJeuFormData,
                        sectionId: value || "",
                      })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionner une section (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          Section {section.niveau} - {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-jeu-niveau"
                    className="text-sm font-medium text-gray-700"
                  >
                    Niveau *
                  </Label>
                  <Input
                    id="edit-jeu-niveau"
                    value={getEditJeuNiveau()}
                    className="border-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Niveau du jeu"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-jeu-langue"
                    className="text-sm font-medium text-gray-700"
                  >
                    Langue
                  </Label>
                  <Select
                    value={editJeuFormData.langue}
                    onValueChange={(value) =>
                      setEditJeuFormData({ ...editJeuFormData, langue: value })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-jeu-image"
                    className="text-sm font-medium text-gray-700"
                  >
                    Image
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="edit-jeu-image"
                      value={editJeuFormData.image}
                      onChange={(e) =>
                        setEditJeuFormData({
                          ...editJeuFormData,
                          image: e.target.value,
                        })
                      }
                      className="border-2 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="URL de l'image ou téléchargez un fichier"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleEditJeuImageUpload(file);
                          }
                        }}
                        className="hidden"
                        id="edit-jeu-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById("edit-jeu-image-upload")
                            ?.click()
                        }
                        disabled={isUploading}
                        className="border-2 hover:border-blue-300"
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        {isUploading ? "Upload..." : "Télécharger"}
                      </Button>
                      {editJeuFormData.image && (
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">
                            Image sélectionnée
                          </span>
                        </div>
                      )}
                    </div>
                    {editJeuFormData.image && (
                      <div className="mt-2">
                        <Image
                          src={getImageUrl(editJeuFormData.image)}
                          alt="Preview"
                          width={100}
                          height={100}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-blue-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-jeu-numOrder"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ordre
                  </Label>
                  <Input
                    id="edit-jeu-numOrder"
                    type="number"
                    value={editJeuFormData.numOrder}
                    onChange={(e) =>
                      setEditJeuFormData({
                        ...editJeuFormData,
                        numOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0 space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditJeuDialogOpen(false)}
                className="border-2"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSaveJeu}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
              >
                <Star className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Question Dialog */}
        <Dialog
          open={isAddQuestionDialogOpen}
          onOpenChange={setIsAddQuestionDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center text-xl">
                <Plus className="h-5 w-5 mr-2 text-purple-600" />
                Ajouter une Question
              </DialogTitle>
              <DialogDescription>
                Créez une nouvelle question pour le jeu sélectionné.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="question-intitule"
                    className="text-sm font-medium text-gray-700"
                  >
                    Question *
                  </Label>
                  <Textarea
                    id="question-intitule"
                    value={addQuestionFormData.intitule}
                    onChange={(e) =>
                      setAddQuestionFormData({
                        ...addQuestionFormData,
                        intitule: e.target.value,
                      })
                    }
                    className="border-2 focus:border-purple-500 focus:ring-purple-500 min-h-[100px]"
                    placeholder="Entrez votre question ici..."
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="question-langue"
                    className="text-sm font-medium text-gray-700"
                  >
                    Langue
                  </Label>
                  <Select
                    value={addQuestionFormData.langue}
                    onValueChange={(value) =>
                      setAddQuestionFormData({
                        ...addQuestionFormData,
                        langue: value,
                      })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="question-orderNum"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ordre
                  </Label>
                  <Input
                    id="question-orderNum"
                    type="number"
                    value={addQuestionFormData.orderNum}
                    onChange={(e) =>
                      setAddQuestionFormData({
                        ...addQuestionFormData,
                        orderNum: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-2 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Réponses *
                  </Label>
                  <div className="space-y-3">
                    {addQuestionFormData.reponses.map((reponse, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <Input
                            value={reponse.intitule}
                            onChange={(e) => {
                              const newReponses = [
                                ...addQuestionFormData.reponses,
                              ];
                              newReponses[index].intitule = e.target.value;
                              setAddQuestionFormData({
                                ...addQuestionFormData,
                                reponses: newReponses,
                              });
                            }}
                            placeholder={`Réponse ${index + 1}`}
                            className="border-2 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={reponse.isCorrect}
                            onChange={(e) => {
                              const newReponses = [
                                ...addQuestionFormData.reponses,
                              ];
                              newReponses[index].isCorrect = e.target.checked;
                              setAddQuestionFormData({
                                ...addQuestionFormData,
                                reponses: newReponses,
                              });
                            }}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-600">
                            Correcte
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newReponses =
                              addQuestionFormData.reponses.filter(
                                (_, i) => i !== index,
                              );
                            setAddQuestionFormData({
                              ...addQuestionFormData,
                              reponses: newReponses,
                            });
                          }}
                          disabled={addQuestionFormData.reponses.length <= 2}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setAddQuestionFormData({
                          ...addQuestionFormData,
                          reponses: [
                            ...addQuestionFormData.reponses,
                            {
                              intitule: "",
                              isCorrect: false,
                              langue: addQuestionFormData.langue,
                            },
                          ],
                        })
                      }
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une réponse
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0 space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddQuestionDialogOpen(false)}
                className="border-2"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSaveNewQuestion}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Question Dialog */}
        <Dialog
          open={isEditQuestionDialogOpen}
          onOpenChange={setIsEditQuestionDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center text-xl">
                <Edit className="h-5 w-5 mr-2 text-purple-600" />
                Modifier la Question
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations de la question sélectionnée.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-question-intitule"
                    className="text-sm font-medium text-gray-700"
                  >
                    Question *
                  </Label>
                  <Textarea
                    id="edit-question-intitule"
                    value={editQuestionFormData.intitule}
                    onChange={(e) =>
                      setEditQuestionFormData({
                        ...editQuestionFormData,
                        intitule: e.target.value,
                      })
                    }
                    className="border-2 focus:border-purple-500 focus:ring-purple-500 min-h-[100px]"
                    placeholder="Entrez votre question ici..."
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-question-langue"
                    className="text-sm font-medium text-gray-700"
                  >
                    Langue
                  </Label>
                  <Select
                    value={editQuestionFormData.langue}
                    onValueChange={(value) =>
                      setEditQuestionFormData({
                        ...editQuestionFormData,
                        langue: value,
                      })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-question-orderNum"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ordre
                  </Label>
                  <Input
                    id="edit-question-orderNum"
                    type="number"
                    value={editQuestionFormData.orderNum}
                    onChange={(e) =>
                      setEditQuestionFormData({
                        ...editQuestionFormData,
                        orderNum: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-2 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Réponses (modification des réponses via l&apos;API séparée)
                  </Label>
                  <div className="space-y-3">
                    {editQuestionFormData.reponses.map((reponse, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <div className="flex-1">
                          <Input
                            value={reponse.intitule}
                            disabled
                            placeholder={`Réponse ${index + 1}`}
                            className="border-2 bg-white"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={reponse.isCorrect}
                            disabled
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-600">
                            Correcte
                          </span>
                        </div>
                      </div>
                    ))}
                    {editQuestionFormData.reponses.length === 0 && (
                      <p className="text-sm text-gray-500 italic">
                        Aucune réponse disponible
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0 space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditQuestionDialogOpen(false);
                  setEditingQuestion(null);
                }}
                className="border-2"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSaveQuestion}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
              >
                <Edit className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
