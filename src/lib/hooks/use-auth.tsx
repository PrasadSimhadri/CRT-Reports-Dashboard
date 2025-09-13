"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean | undefined;
  login: (data: { username: string; pass: string; userData?: any }) => void;
  logout: () => void;
  user: { username: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const token = localStorage.getItem('apex-auth-token');
      if (token) {
        setIsAuthenticated(true);
        setUser({ username: 'admin' }); // fallback username
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  }, []);

  const login = (data: { username: string; pass: string; userData?: any }) => {
    if (data.userData?.Usertype) {
      localStorage.setItem("apex-auth-token", "mock-token");
      localStorage.setItem("apex-usertype", data.userData.Usertype);
      localStorage.setItem("apex-centercity", data.userData.centercity);
      localStorage.setItem("apex-batchcode", data.userData.batchcode);
      localStorage.setItem("apex-login", JSON.stringify(data.userData));
      setIsAuthenticated(true);
      setUser({ username: data.username });
      router.push("/");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid username or password.",
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('apex-auth-token');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};