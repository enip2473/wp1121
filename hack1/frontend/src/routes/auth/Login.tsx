import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

const Login = () => {
  return (
    <CardFooter className="flex justify-between">
      <Button asChild variant="link" size="sm" className="px-0" type="button">
        {/* TODO 1.3: Route Configuration for Login and Register Pages (8%) */}
        <Link data-testid="link-register" to="/register">
          Don't have an account?
        </Link>
        {/* End of TODO 1.3 */}
      </Button>
      <Button size="sm">Login</Button>
    </CardFooter>
  );
};

export default Login;
