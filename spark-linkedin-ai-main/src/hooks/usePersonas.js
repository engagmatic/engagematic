import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api.js';
import { useToast } from '@/hooks/use-toast';

export function usePersonas() {
  const [personas, setPersonas] = useState([]);
  const [samplePersonas, setSamplePersonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchPersonas = useCallback(async () => {
    try {
      const response = await apiClient.getPersonas();
      if (response.success) {
        setPersonas(response.data.personas);
      } else {
        throw new Error(response.message || 'Failed to fetch personas');
      }
    } catch (error) {
      console.error('Fetch personas error:', error);
      toast({
        title: "Failed to load personas",
        description: error.message || "Could not fetch your personas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchSamplePersonas = useCallback(async () => {
    try {
      const response = await apiClient.getSamplePersonas();
      if (response.success) {
        setSamplePersonas(response.data.personas);
      }
    } catch (error) {
      console.error('Fetch sample personas error:', error);
    }
  }, []);

  const createPersona = useCallback(async (personaData) => {
    setIsCreating(true);
    try {
      const response = await apiClient.createPersona(personaData);
      if (response.success) {
        setPersonas(prev => [response.data.persona, ...prev]);
        toast({
          title: "Persona created! 👤",
          description: "Your new AI persona is ready to use",
        });
        return { success: true, persona: response.data.persona };
      } else {
        throw new Error(response.message || 'Failed to create persona');
      }
    } catch (error) {
      console.error('Create persona error:', error);
      
      if (error.message.includes('limit reached')) {
        toast({
          title: "Persona limit reached",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Creation failed",
          description: error.message || "Failed to create persona",
          variant: "destructive",
        });
      }
      
      return { success: false, error: error.message };
    } finally {
      setIsCreating(false);
    }
  }, [toast]);

  const updatePersona = useCallback(async (personaId, personaData) => {
    try {
      const response = await apiClient.updatePersona(personaId, personaData);
      if (response.success) {
        setPersonas(prev => 
          prev.map(p => p._id === personaId ? response.data.persona : p)
        );
        toast({
          title: "Persona updated! ✏️",
          description: "Your persona has been updated successfully",
        });
        return { success: true, persona: response.data.persona };
      } else {
        throw new Error(response.message || 'Failed to update persona');
      }
    } catch (error) {
      console.error('Update persona error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update persona",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  }, [toast]);

  const deletePersona = useCallback(async (personaId) => {
    try {
      const response = await apiClient.deletePersona(personaId);
      if (response.success) {
        setPersonas(prev => prev.filter(p => p._id !== personaId));
        toast({
          title: "Persona deleted",
          description: "Persona has been removed successfully",
        });
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to delete persona');
      }
    } catch (error) {
      console.error('Delete persona error:', error);
      
      if (error.message.includes('only persona')) {
        toast({
          title: "Cannot delete",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Delete failed",
          description: error.message || "Failed to delete persona",
          variant: "destructive",
        });
      }
      
      return { success: false, error: error.message };
    }
  }, [toast]);

  const setDefaultPersona = useCallback(async (personaId) => {
    try {
      const response = await apiClient.setDefaultPersona(personaId);
      if (response.success) {
        setPersonas(prev => 
          prev.map(p => ({
            ...p,
            isDefault: p._id === personaId
          }))
        );
        toast({
          title: "Default persona updated",
          description: "Your default persona has been changed",
        });
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to set default persona');
      }
    } catch (error) {
      console.error('Set default persona error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to set default persona",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  }, [toast]);

  const getDefaultPersona = useCallback(() => {
    return personas.find(p => p.isDefault) || personas[0];
  }, [personas]);

  useEffect(() => {
    fetchPersonas();
    fetchSamplePersonas();
  }, [fetchPersonas, fetchSamplePersonas]);

  return {
    personas,
    samplePersonas,
    isLoading,
    isCreating,
    createPersona,
    updatePersona,
    deletePersona,
    setDefaultPersona,
    getDefaultPersona,
    refetchPersonas: fetchPersonas,
  };
}
