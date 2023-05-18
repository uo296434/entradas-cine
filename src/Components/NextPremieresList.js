import React from 'react';
import { Link } from "react-router-dom";
import { Card, Col, Row } from 'antd';
import { Input, Tag, Pagination, Select } from 'antd';

class NextPremieresList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            nextpremieres : [],
            user : null,
            currentPage: 1,
            moviesPerPage: 4,
            searchQuery: '',
            selectedGenre: '',
            selectedAge: '',
        }  
        this.getNextPremieresSummary();
    }

    getNextPremieresSummary = async () => {        
        const { data: { user } } = await this.props.supabase.auth.getUser();

        if ( user != null ){
            this.setState({
                user : user
            })
        }

        const { data, error } = await this.props.supabase
            .from('next_premiere')
            .select()
  
        if ( error == null){
            this.setState({
                nextpremieres : data
            }) 
        }
    } 

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    };

    handleSearch = (value) => {
        this.setState({ searchQuery: value });
    };

    handleGenreChange = (value) => {
        this.setState({ selectedGenre: value });
    };
    
    handleAgeChange = (value) => {
        this.setState({ selectedAge: value });
    };

    render() {
        const isLoggedIn = this.state.user != null ? true : false;

        const { currentPage, moviesPerPage, searchQuery, selectedGenre, selectedAge } = this.state;
        const filteredMovies = this.state.nextpremieres.filter((movie) => {
            const titleMatch = movie.title.toUpperCase().includes(searchQuery.toUpperCase());
            const genreMatch = selectedGenre === '' || movie.genre === selectedGenre;
            const ageMatch = selectedAge === '' || movie.age === selectedAge;
            return titleMatch && genreMatch && ageMatch;
        });
        const indexOfLastMovie = currentPage * moviesPerPage;
        const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
        const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
        const totalResults = filteredMovies.length;

        const { Option } = Select;

        return (
            <div>
                { isLoggedIn ? ( 
                    <>
                        <Input.Search
                            size="large"
                            placeholder="Introduce el nombre de la película"
                            style={{ width: '100%', maxWidth: 800, marginBottom: 20, marginRight: 20 }}
                            onSearch={this.handleSearch}
                            enterButton
                        />
                        <Select
                            placeholder="Filtrar por género"                            
                            size="large"
                            style={{ width: '100%', maxWidth: 200, marginBottom: 20, marginRight: 20 }}
                            onChange={this.handleGenreChange}
                        >   
                            <Option value="">Todas por categoría</Option>
                            <Option value="Acción">Acción</Option>
                            <Option value="Suspense">Suspense</Option>
                            <Option value="Drama">Drama</Option>
                        </Select>
                        <Select
                            placeholder="Filtrar por edad"                            
                            size="large"
                            style={{ width: '100%', maxWidth: 200, marginBottom: 20 }}
                            onChange={this.handleAgeChange}
                        >
                            <Option value="">Todas por edad</Option>
                            <Option value="Pendiente">Pendiente</Option>
                            <Option value="12">+12</Option>
                            <Option value="16">+16</Option>
                        </Select>
                    </>) : null }
                <br/><br/>
                { (searchQuery !== '' || selectedGenre !== '' || selectedAge !== '') && totalResults > 0 && (
                    <p style={{ textAlign: 'right', marginBottom: 20, marginTop: -10 }}>
                        Resultados encontrados: {totalResults}
                    </p>
                )}
                <Row gutter={ [40, 40] } justify="center">
                    { currentMovies.map( movie => {
                        movie.linkTo = "/upcomingmovie/"+movie.id;
                        let image = <img src={process.env.REACT_APP_SUPBASE_STORAGE + "/imageMockup.png"} alt="Imagen por defecto"/>
                        if ( movie.cartel != null ){
                            image = <img src={ "https://jfbitiqhttjjzcrxatys.supabase.co/storage/v1/object/public/images/" + movie.cartel } alt="Cartel película"/> 
                        }
                        return ( 
                            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                                <Link to={ movie.linkTo }>
                                <Card hoverable key={ movie.id } title={<b>{ movie.title }</b>}
                                        cover={ image }>
                                        <>
                                            <Tag color="green">{movie.age}</Tag>
                                            <Tag color="red">{movie.duration}'</Tag>
                                            <Tag color="blue">{movie.genre}</Tag>
                                        </>
                                    </Card>
                                </Link>
                            </Col>  
                        )
                    })}
                </Row>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Pagination
                        current={currentPage}
                        pageSize={moviesPerPage}
                        total={this.state.nextpremieres.length}
                        onChange={this.handlePageChange}
                    />
                </div>
            </div>
        )
    }
}

export default NextPremieresList;