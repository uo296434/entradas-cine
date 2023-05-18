import React from 'react';
import LoginForm from './LoginForm';
import MoviesList from './Components/MoviesList';
import MovieDetails from './Components/MovieDetails';
import SessionsList from './Components/SessionsList';
import SessionDetails from './Components/SessionDetails';
import TicketsList from './Components/TicketsList';
import NextPremieresList from './Components/NextPremieresList';
import UpcomingMovieDetails from './Components/NextPremiereDetails';
import PromosList from './Components/PromosList';
import PromoDetails from './Components/PromoDetails';
import ShoppingCartTicketsList from './Components/ShoppingCartTicketsList';
import ShoppingCartPromosList from './Components/ShoppingCartPromosList';
import withRouter from './Components/withRouter';
import { createClient } from '@supabase/supabase-js';
import { Route, Routes, Link } from "react-router-dom";
import { Layout, Menu } from 'antd';
import { Col, Row } from 'antd';
import { Avatar, Typography  } from 'antd';
import { FastForwardOutlined, PlayCircleOutlined , ThunderboltOutlined, ShoppingCartOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import PaymentDetails from './Components/PaymentDetails';
import Logout from './Components/Logout';

class App extends React.Component {

    constructor(props) {
        super(props)
    
        const options = {
            schema: 'public',
            headers: { 'x-my-custom-header': 'my-app-name' },
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    
        const supabase = createClient(
            'https://jfbitiqhttjjzcrxatys.supabase.co', 
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYml0aXFodHRqanpjcnhhdHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM5ODYwNTIsImV4cCI6MTk5OTU2MjA1Mn0.zLarxTzaRy54kF7q_kSRiDggLdy_OL4blBvV1WaP9uI',
            options
        )
    
        this.supabase = supabase;

        this.state = {
            user : null
        }
    }    

    componentDidMount = async () => {
        if ( this.state.user == null){
            const { data: { user } } = await this.supabase.auth.getUser();
    
            if ( user != null ){
                this.setState({
                    user : user
                })
            }
        }
    }  

    callBackOnFinishLoginForm = async (loginUser) => {
        // signIn
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: loginUser.email,
            password: loginUser.password,
        })

        if (error != null){
            // signUp, Create user
            const { data, error } = await this.supabase.auth.signUp({
                email: loginUser.email,
                password: loginUser.password,
            })

            if ( error == null && data.user != null ){
                this.setState({
                    user : data.user
                })
            }   
        }
  
        if ( error == null && data.user != null ){
            this.setState({
                user : data.user
            })
        }  
        
        this.props.navigate("/movies");
    } 
    
    render() {
        const { Header, Footer, Content } = Layout;
        const { Text } = Typography;
        const isLoggedIn = this.state.user != null ? true : false;

        return (
        <Layout className="layout">
            <Header>
                <Row>
                    <Col xs= {18} sm={19} md={20} lg={21} xl = {22}>
                        <Menu theme="dark" mode="horizontal" items={[
                            { key:"logo",  label: <Link to="/movies"><img src={process.env.REACT_APP_SUPBASE_STORAGE + "/logo.png"} width="40" height="40" alt="Logo"/></Link>},
                            { key:"menuMovies",  label: <Link to="/movies">Cartelera</Link>, icon: <PlayCircleOutlined/>},
                            { key:"menuUpcomingMovies",  label: <Link to="/nextpremieres">Próximos estrenos</Link>, icon: <FastForwardOutlined/>},
                            { key:"menuPromos",  label: <Link to="/promos">Promociones</Link>, icon: <ThunderboltOutlined/>},
                            { key:"menuShoppingCart",  label: <Link to="/shoppingcart">Carrito</Link>, icon: <ShoppingCartOutlined/>, hidden: !isLoggedIn },
                            { key:"menuLogin",  label: isLoggedIn ? <Link to="/logout">Cerrar Sesión</Link> : <Link to="/login">Inicio Sesión</Link>, icon: isLoggedIn ? <LogoutOutlined/> : <LoginOutlined/> },
                            ]} >
                        </Menu>
                    </Col>
                    <Col xs= {6} sm={5} md = {4}  lg = {3} xl = {2} style={{display: 'flex', flexDirection: 'row-reverse' }}>
                        { this.state.user != null ? (
                            <Avatar style={{ backgroundColor: "#FECBC1", color:"#000000" , marginTop: 12  }} size="large" >
                                { this.state.user.email.charAt(0) }
                            </Avatar>
                        ) : (
                            <Text></Text>
                        )}
                    </Col>
                </Row>
            </Header>

            <Content style={{ padding: '0 50px' }}>
                <div className="site-layout-content">
                    <Row style={{ marginTop: 34 }}>
                        <Col span={24}>
                            <Routes>
                                <Route path="/login" element={ 
                                    <LoginForm callBackOnFinishLoginForm={this.callBackOnFinishLoginForm} signIn={this.supabase.auth.signInWithEmail}/> 
                                } />
                                <Route path="/movies" element={ 
                                    <MoviesList supabase={this.supabase} /> 
                                } />
                                <Route path="/movie/:id" element={ 
                                    <div>
                                        <MovieDetails supabase={this.supabase}/> 
                                        <SessionsList supabase={this.supabase}/> 
                                    </div>
                                } />
                                <Route path="/movie/:id/session/:id" element={ 
                                    <div>
                                        <SessionDetails supabase={this.supabase}/>
                                        <TicketsList supabase={this.supabase}/>
                                    </div>                                     
                                } />                                
                                <Route path="/nextpremieres" element={ 
                                    <NextPremieresList supabase={this.supabase} /> 
                                } /> 
                                <Route path="/upcomingmovie/:id" element={ 
                                    <UpcomingMovieDetails supabase={this.supabase}/> 
                                } />
                                <Route path="/promos" element={ 
                                    <PromosList supabase={this.supabase}/> 
                                } />
                                <Route path="/promo/:id" element={ 
                                    <PromoDetails supabase={this.supabase}/> 
                                } />
                                <Route path="/shoppingcart" element={ 
                                    <div>
                                        <ShoppingCartTicketsList supabase={this.supabase}/> 
                                        <ShoppingCartPromosList supabase={this.supabase}/> 
                                        <PaymentDetails supabase={this.supabase}/>
                                    </div>
                                } />
                                <Route path="/logout" element={ 
                                    <Logout supabase={this.supabase}/> 
                                } />
                            </Routes>
                        </Col>
                    </Row>
                </div>
            </Content>
            
            <Footer style={{ textAlign: 'center' }}> Entradas Cine 2023 </Footer>
        </Layout>
        );

    }
}

export default withRouter(App);
