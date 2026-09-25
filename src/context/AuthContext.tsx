import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Business } from '../types';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  businessId: string;
  loading: boolean;
  switchUser: (email: string) => Promise<void>;
  registerBusiness: (data: any) => Promise<any>;
  refreshAuth: () => Promise<void>;
  isStaff: boolean;
  isOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [businessId, setBusinessId] = useState<string>('biz_glow_salon');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAuth = async (currentBizId = businessId) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { 'x-business-id': currentBizId },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setBusiness(data.business);
        setBusinessId(data.user.businessId);
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  const switchUser = async (email: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setBusiness(data.business);
        setBusinessId(data.user.businessId);
      }
    } catch (err) {
      console.error('Error switching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const registerBusiness = async (formData: any) => {
    const res = await fetch('/api/auth/register-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error('Registration failed');
    const data = await res.json();
    setUser(data.user);
    setBusiness(data.business);
    setBusinessId(data.business.id);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        businessId,
        loading,
        switchUser,
        registerBusiness,
        refreshAuth: () => fetchAuth(businessId),
        isStaff: user?.role === 'staff',
        isOwner: user?.role === 'owner',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
