import React from 'react';
import withRouter from './withRouter';

class Logout extends React.Component {

    componentDidMount() {
        this.handleLogout();
    }

    handleLogout = async () => {
        await this.props.supabase.auth.signOut();
        this.props.navigate('/login');
        window.location.reload();
    };

    render() {
        return <div>Cerrando sesión...</div>;
    }
}

export default withRouter(Logout);