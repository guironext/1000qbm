"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Edit, 
  Trash2,
  Crown,
  Star,
  Search,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Trophy,
  ArrowLeft
} from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  langue?: string;
  country?: string;
  phone?: string;
  role: 'ADMIN' | 'JOUEUR' | 'MANAGER';
  createdAt: string;
  updatedAt: string;
  palmares?: Palmares[];
}

interface Palmares {
  id: string;
  score: number;
  isFinished: boolean;
  jeuValide: boolean;
  niveauJeu: string;
  createdAt: string;
  jeu?: {
    id: string;
    niveau: string;
    stage?: {
      title: string;
      niveau: string;
    };
    section?: {
      title: string;
      niveau: string;
    };
  };
}

const UsersManagement = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'JOUEUR' as 'ADMIN' | 'JOUEUR' | 'MANAGER',
    phone: '',
    country: '',
    langue: 'FR'
  });

  const roleOptions = [
    { value: 'ADMIN', label: 'Administrateur', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'MANAGER', label: 'Manager', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'JOUEUR', label: 'Joueur', color: 'bg-blue-100 text-blue-800 border-blue-200' }
  ];

  const languageOptions = [
    { value: 'FR', label: 'Français' },
    { value: 'EN', label: 'English' },
    { value: 'ES', label: 'Español' },
    { value: 'PT', label: 'Português' },
    { value: 'DE', label: 'Deutsch' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      } else {
        toast.error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      country: user.country || '',
      langue: user.langue || 'FR'
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingUser.id,
          ...editFormData
        }),
      });

      if (response.ok) {
        toast.success('Utilisateur modifié avec succès!');
        await loadUsers();
        setIsEditDialogOpen(false);
        setEditingUser(null);
      } else {
        const error = await response.json();
        toast.error('Erreur lors de la modification: ' + (error.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action supprimera également tous ses scores.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Utilisateur supprimé avec succès!');
        await loadUsers();
      } else {
        const error = await response.json();
        toast.error('Erreur lors de la suppression: ' + (error.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const roleOption = roleOptions.find(r => r.value === role);
    return roleOption?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUserStats = (user: User) => {
    const totalGames = user.palmares?.length || 0;
    const completedGames = user.palmares?.filter(p => p.isFinished).length || 0;
    const averageScore = totalGames > 0 
      ? Math.round((user.palmares?.reduce((sum, p) => sum + p.score, 0) || 0) / totalGames)
      : 0;
    
    return { totalGames, completedGames, averageScore };
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-2 hover:border-blue-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Gestion des Utilisateurs
                    </h1>
                    <p className="text-lg text-gray-600">Gérez les joueurs et administrateurs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
              <CardTitle className="flex items-center text-white text-lg">
                <Users className="h-5 w-5 mr-2" />
                Total
              </CardTitle>
            </div>
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-gray-900">{users.length}</div>
              <p className="text-sm text-gray-600">Utilisateurs inscrits</p>
            </CardContent>
          </Card>

          {roleOptions.map((role) => {
            const count = users.filter(u => u.role === role.value).length;
            return (
              <Card key={role.value} className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <div className={`p-4 ${role.value === 'ADMIN' ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                                       role.value === 'MANAGER' ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 
                                       'bg-gradient-to-r from-blue-500 to-blue-600'}`}>
                  <CardTitle className="flex items-center text-white text-lg">
                    {role.value === 'ADMIN' && <Crown className="h-5 w-5 mr-2" />}
                    {role.value === 'MANAGER' && <UserCheck className="h-5 w-5 mr-2" />}
                    {role.value === 'JOUEUR' && <Users className="h-5 w-5 mr-2" />}
                    {role.label}
                  </CardTitle>
                </div>
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-gray-900">{count}</div>
                  <p className="text-sm text-gray-600">
                    {role.value === 'ADMIN' ? 'Administrateurs' : 
                     role.value === 'MANAGER' ? 'Managers' : 'Joueurs'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, prénom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les rôles</SelectItem>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <CardTitle className="flex items-center text-white text-xl">
              <Users className="h-6 w-6 mr-3" />
              Liste des Utilisateurs ({filteredUsers.length})
            </CardTitle>
            <CardDescription className="text-indigo-100 mt-2">
              Gérez les comptes utilisateurs et leurs permissions
            </CardDescription>
          </div>
          <CardContent className="p-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-gray-500">
                  {searchTerm || roleFilter !== 'ALL' 
                    ? 'Aucun utilisateur ne correspond à vos critères de recherche.' 
                    : 'Aucun utilisateur n\'est encore inscrit.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const stats = getUserStats(user);
                  return (
                    <div key={user.id} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-1" />
                                  {user.email}
                                </div>
                                {user.phone && (
                                  <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-1" />
                                    {user.phone}
                                  </div>
                                )}
                                {user.country && (
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {user.country}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge className={`px-3 py-1 text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                              {roleOptions.find(r => r.value === user.role)?.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Calendar className="h-4 w-4 mr-1" />
                                Inscrit le
                              </div>
                              <div className="font-medium text-gray-900">
                                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Trophy className="h-4 w-4 mr-1" />
                                Parties jouées
                              </div>
                              <div className="font-medium text-gray-900">
                                {stats.totalGames}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Star className="h-4 w-4 mr-1" />
                                Parties terminées
                              </div>
                              <div className="font-medium text-gray-900">
                                {stats.completedGames}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Trophy className="h-4 w-4 mr-1" />
                                Score moyen
                              </div>
                              <div className="font-medium text-gray-900">
                                {stats.averageScore}
                              </div>
                            </div>
                          </div>

                          {user.langue && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <span className="font-medium mr-2">Langue:</span>
                              {languageOptions.find(l => l.value === user.langue)?.label || user.langue}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="border-2 hover:border-blue-300 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="border-2 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <Edit className="h-5 w-5 mr-2 text-blue-600" />
                Modifier l&apos;Utilisateur
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations de l&apos;utilisateur sélectionné.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                    className="border-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                    className="border-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="border-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Rôle
                </Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData({...editFormData, role: value as 'ADMIN' | 'JOUEUR' | 'MANAGER'})}
                >
                  <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className="border-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    Pays
                  </Label>
                  <Input
                    id="country"
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({...editFormData, country: e.target.value})}
                    className="border-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="langue" className="text-sm font-medium text-gray-700">
                  Langue
                </Label>
                <Select
                  value={editFormData.langue}
                  onValueChange={(value) => setEditFormData({...editFormData, langue: value})}
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
            </div>
            <DialogFooter className="space-x-2">
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
                onClick={handleSaveUser}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
              >
                <Star className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UsersManagement;
