'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocaleSettings } from '@/store';
import { LOCALE_NAMES, LOCALE_FLAGS } from '@/lib/locale';
import { useRouter, usePathname } from 'next/navigation';

type Locale = keyof typeof LOCALE_NAMES;

export function LanguageSelector() {
  const { locale, setLocale } = useLocaleSettings();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    // Replace the locale in the URL
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <div className="hidden sm:inline">
            {LOCALE_FLAGS[locale]} {LOCALE_NAMES[locale]}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(LOCALE_NAMES).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLocaleChange(code as Locale)}
            className="cursor-pointer"
          >
            <div className="mr-2">{LOCALE_FLAGS[code as Locale]}</div>
            <div>{name}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}