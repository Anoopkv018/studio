
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
  },
  {
    title: 'ಬೆಲೆ ಮಾಹಿತಿ',
    subtitle: 'ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ತಿಳಿಯಿರಿ',
    icon: <DollarSign size={40} />,
    href: '/price',
  },
  {
    title: 'ಬೆಳೆ ಬೆಳೆಸುವ ಮಾರ್ಗದರ್ಶನ',
    subtitle: 'ವಾರಕ್ಕೊಮ್ಮೆ ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ',
    icon: <Compass size={40} />,
    href: '/guide',
  },
  {
    title: 'ಕೃಷಿ ಯೂಟ್ಯೂಬ್ ವಿಡಿಯೋಗಳು',
    subtitle: 'ಕೃಷಿ ತಜ್ಞರ ವಿಡಿಯೋಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    icon: <Youtube size={40} />,
    href: '/youtube',
  },
 
  {
    title: 'ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳು',
    subtitle: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ',
    icon: <Landmark size={40} />,
    href: '/schemes',
  },
  {
    title: 'ಹತ್ತಿರದ ಕೃಷಿ ಸೇವೆಗಳು',
    subtitle: 'ಹತ್ತಿರದ ಅಂಗಡಿಗಳು ಮತ್ತು ಸೇವಾ ಕೇಂದ್ರಗಳು',
    icon: <MapPin size={40} />,
    href: '/agro-services',
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline text-primary tracking-tight">
          ಕೃಷಿ ಮಿತ್ರ
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          ನಿಮ್ಮ ಕೃಷಿ ಚಟುವಟಿಕೆಗಳಿಗೆ ನಮ್ಮ ಬೆಂಬಲ
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.href} {...service} />
        ))}
      </div>
    </div>
  );
}
