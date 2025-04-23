
import { PenLine, Upload, Keyboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const InputMethods = () => {
  const methods = [
    {
      name: 'Draw',
      icon: PenLine,
      path: '/draw',
      description: 'Draw equations by hand',
    },
    {
      name: 'Upload',
      icon: Upload,
      path: '/upload',
      description: 'Upload images with equations',
    },
    {
      name: 'Type',
      icon: Keyboard,
      path: '/type',
      description: 'Type equations with math keyboard',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
      {methods.map((method) => (
        <Link
          key={method.name}
          to={method.path}
          className="input-method-button"
        >
          <method.icon className="input-method-icon" />
          <h2 className="text-lg font-semibold">{method.name}</h2>
          <p className="text-sm text-muted-foreground text-center">
            {method.description}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default InputMethods;
