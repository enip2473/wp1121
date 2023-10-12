import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

const Register = () => {
  return (
    <CardFooter className="flex justify-between">
      <Button asChild variant="link" size="sm" className="px-0" type="button">
        {/* TODO 1.3: Route Configuration for Login and Register Pages (8%) */}
        <Link data-testid="link-login" to="/login">
          Already have an account?
        </Link>
        {/* End of TODO 1.3 */}
      </Button>
      <Button size="sm">Register</Button>
    </CardFooter>
  );
};

export default Register;
