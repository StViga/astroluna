import React, { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  HomeIcon,
  SparklesIcon,
  BookOpenIcon,
  CreditCardIcon,
  UserCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/authStore';
import { usePayment } from '@/store/paymentStore';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { clsx } from 'clsx';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { currentSubscription, subscriptionPlans } = usePayment();

  // Get current plan info
  const currentPlan = currentSubscription 
    ? subscriptionPlans.find(p => p.id === currentSubscription.planId)
    : subscriptionPlans.find(p => p.id === 'free');
    
  const generationsRemaining = currentSubscription
    ? (currentSubscription.maxGenerations === -1 
        ? 'Unlimited' 
        : Math.max(0, currentSubscription.maxGenerations - currentSubscription.generationsUsed))
    : (currentPlan?.maxGenerations || 0);

  const navigation = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: HomeIcon,
      current: location.pathname === '/dashboard',
    },
    {
      name: 'Generate',
      href: '/dashboard/generate',
      icon: SparklesIcon,
      current: location.pathname === '/dashboard/generate',
    },
    {
      name: 'Library',
      href: '/dashboard/library',
      icon: BookOpenIcon,
      current: location.pathname === '/dashboard/library',
      badge: user ? '12' : undefined, // Example badge
    },
    {
      name: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCardIcon,
      current: location.pathname === '/dashboard/billing',
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserCircleIcon,
      current: location.pathname === '/dashboard/profile',
    },
  ];

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black bg-opacity-70 backdrop-blur-md px-6 pb-4 border-r border-white border-opacity-20">
      <div className="flex h-16 shrink-0 items-center">
        <Link to="/dashboard" className="flex items-center">
          <span className="text-2xl">🌟</span>
          <span className="ml-2 text-xl font-bold text-white drop-shadow-lg">
            AstroLuna
          </span>
        </Link>
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={clsx(
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200',
                      item.current
                        ? 'bg-white bg-opacity-20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <item.icon
                      className={clsx(
                        'h-6 w-6 shrink-0 transition-colors',
                        item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span
                        className={clsx(
                          'ml-3 inline-block py-0.5 px-2 text-xs rounded-full transition-colors',
                          item.current
                            ? 'bg-white bg-opacity-30 text-white'
                            : 'bg-gray-600 text-gray-300 group-hover:bg-white group-hover:bg-opacity-20 group-hover:text-white'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* Subscription Status */}
          <li className="mt-auto">
            <div className="rounded-lg bg-gradient-cosmic bg-opacity-30 backdrop-blur-sm p-4 text-center border border-white border-opacity-20 shadow-lg">
              <div className="text-sm font-medium text-white mb-1 drop-shadow-md">
                {currentPlan?.name || 'Free Plan'}
              </div>
              <div className="text-2xl font-bold text-yellow-300 mb-2 drop-shadow-lg">
                {typeof generationsRemaining === 'string' ? generationsRemaining : generationsRemaining.toLocaleString()}
              </div>
              <div className="text-xs text-gray-300 mb-3">
                {typeof generationsRemaining === 'string' ? 'Generations' : 'Generations left'}
              </div>
              
              {/* Progress bar for limited plans */}
              {currentSubscription && currentSubscription.maxGenerations !== -1 && (
                <div className="mb-3">
                  <div className="bg-white bg-opacity-20 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, ((currentSubscription.maxGenerations - currentSubscription.generationsUsed) / currentSubscription.maxGenerations) * 100))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              <Link
                to="/dashboard/billing"
                className="inline-flex items-center px-3 py-1.5 border border-white border-opacity-30 text-xs font-medium rounded-full text-white bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm"
              >
                {currentSubscription ? 'Manage Plan' : 'Upgrade Plan'}
              </Link>
            </div>
          </li>

          {/* Language Switcher */}
          <li className="px-2 mt-4">
            <LanguageSwitcher variant="sidebar" className="" />
          </li>

          {/* User info */}
          <li className="-mx-6 mt-4">
            <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white border-t border-white border-opacity-20">
              <UserCircleIcon className="h-8 w-8 text-gray-300" />
              <span className="sr-only">Your profile</span>
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium drop-shadow-md">
                  {user?.full_name || 'User'}
                </div>
                <div className="truncate text-xs text-gray-300 drop-shadow-sm">
                  {user?.email}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;