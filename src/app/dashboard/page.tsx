
import { ServiceCard } from '@/components/ServiceCard';
import {
  Bot,
  Compass,
  DollarSign,
  Landmark,
  MapPin,
  Stethoscope,
  Youtube,
} from 'lucide-react';

const services = [
  {
    title: 'ಬೆಳೆ ರೋಗ ಪತ್ತೆ',
    subtitle: 'ನಿಮ್ಮ ಬೆಳೆಗೆ ಬಂದಿರುವ ರೋಗವನ್ನು ಪತ್ತೆ ಮಾಡಿ',
    icon: <Stethoscope size={40} />,
    href: '/diagnose',
    color: '#EB5757',
    textColor: '#FFFFFF',
  },
  {
    title: 'ಬೆಲೆ ಮಾಹಿತಿ',
    subtitle: 'ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ತಿಳಿಯಿರಿ',
    icon: <DollarSign size={40} />,
    href: '/price',
    color: '#27AE60',
    textColor: '#FFFFFF',
  },
  {
    title: 'ಬೆಳೆ ಬೆಳೆಸುವ ಮಾರ್ಗದರ್ಶನ',
    subtitle: 'ವಾರಕ್ಕೊಮ್ಮೆ ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ',
    icon: <Compass size={40} />,
    href: '/guide',
    color: '#2F80ED',
    textColor: '#FFFFFF',
  },
  {
    title: 'ಕೃಷಿ ಯೂಟ್ಯೂಬ್ ವಿಡಿಯೋಗಳು',
    subtitle: 'ಕೃಷಿ ತಜ್ಞರ ವಿಡಿಯೋಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    icon: <Youtube size={40} />,
    href: '/youtube',
    color: '#9B51E0',
    textColor: '#FFFFFF',
  },
  {
    title: 'ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳು',
    subtitle: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ',
    icon: <Landmark size={40} />,
    href: '/schemes',
    color: '#2D9CDB',
    textColor: '#FFFFFF',
  },
  {
    title: 'ಹತ್ತಿರದ ಕೃಷಿ ಸೇವೆಗಳು',
    subtitle: 'ಹತ್ತಿರದ ಅಂಗಡಿಗಳು ಮತ್ತು ಸೇವಾ ಕೇಂದ್ರಗಳು',
    icon: <MapPin size={40} />,
    href: '/agro-services',
    color: '#F2C94C',
    textColor: '#000000',
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-white">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline text-primary-dark tracking-tight">
          ಕೃಷಿ ಮಿತ್ರ
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          ನಿಮ್ಮ ಕೃಷಿ ಚಟುವಟಿಕೆಗಳಿಗೆ ನಮ್ಮ ಬೆಂಬಲ
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <ServiceCard key={service.href} {...service} />
        ))}
      </div>
    </div>
  );
}
