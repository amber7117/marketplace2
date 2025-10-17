'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useUserStore } from '@/store';

type ActiveTab = 'profile' | 'password';

interface UserWithPhone {
  name?: string;
  email?: string;
  phone?: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function ProfilePage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { user, updateUser, logout } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as UserWithPhone)?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as UserWithPhone)?.phone || '',
      });
    }
  }, [user]);

  const handleTabChange = (tab: ActiveTab) => () => setActiveTab(tab);

  const handleProfileInputChange =
    (field: keyof typeof profileData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setProfileData((prev) => ({ ...prev, [field]: value }));
    };

  const handlePasswordInputChange =
    (field: keyof typeof passwordData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setPasswordData((prev) => ({ ...prev, [field]: value }));
    };

  const handlePasswordVisibilityToggle = (field: keyof typeof showPasswords) => () =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.data.data) {
        updateUser(response.data.data);
      }
      alert(t('profileUpdated'));
    } catch (error: unknown) {
      console.error('Profile update failed:', error);
      const apiError = error as ApiError;
      alert(apiError.response?.data?.error || t('updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t('passwordMismatch'));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert(t('passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      alert(t('passwordChanged'));
    } catch (error: unknown) {
      console.error('Password change failed:', error);
      const apiError = error as ApiError;
      alert(apiError.response?.data?.error || t('passwordChangeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const renderProfileForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('profileInfo')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t('name')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder={t('enterName')}
                value={profileData.name}
                onChange={handleProfileInputChange('name')}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={profileData.email}
                onChange={handleProfileInputChange('email')}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              {t('phone')}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={profileData.phone}
                onChange={handleProfileInputChange('phone')}
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? tCommon('saving') : tCommon('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderPasswordForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('changePassword')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-sm font-medium">
              {t('currentPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange('currentPassword')}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={handlePasswordVisibilityToggle('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              {t('newPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange('newPassword')}
                className="pl-10 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={handlePasswordVisibilityToggle('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('confirmPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange('confirmPassword')}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={handlePasswordVisibilityToggle('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? tCommon('processing') : t('changePassword')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const tabContent = {
    profile: renderProfileForm(),
    password: renderPasswordForm(),
  }[activeTab];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('profile')}</h1>
        <p className="text-muted-foreground">{t('profileDescription')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-2">
              <Button
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={handleTabChange('profile')}
              >
                <User className="mr-2 h-4 w-4" />
                {t('profileInfo')}
              </Button>
              <Button
                variant={activeTab === 'password' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={handleTabChange('password')}
              >
                <Lock className="mr-2 h-4 w-4" />
                {t('changePassword')}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                {t('logout')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">{tabContent}</div>
      </div>
    </div>
  );
}
