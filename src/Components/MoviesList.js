import React from 'react';
import { Link } from "react-router-dom";
import { Card, Col, Row } from 'antd';
import { Input, Tag, Pagination, Select } from 'antd';

class MoviesList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            movies : [],
            user : null,
            currentPage: 1,
            moviesPerPage: 4,
            searchQuery: '',
            selectedGenre: '',
            selectedAge: '',
        }  
        this.getMoviesSummary();
    }

    getMoviesSummary = async () => {        
        const { data: { user } } = await this.props.supabase.auth.getUser();

        if ( user != null ){
            this.setState({
                user : user
            })
        }

        const { data, error } = await this.props.supabase
            .from('movie')
            .select()
  
        if ( error == null){
            this.setState({
                movies : data
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
        const filteredMovies = this.state.movies.filter((movie) => {
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
                            <Option value="Animación">Animación</Option>
                            <Option value="Comedia">Comedia</Option>
                            <Option value="Drama">Drama</Option>
                            <Option value="Fantasía">Fantasía</Option>
                            <Option value="Romance">Romance</Option>
                            <Option value="Thriller">Thriller</Option>
                        </Select>
                        <Select
                            placeholder="Filtrar por edad"                            
                            size="large"
                            style={{ width: '100%', maxWidth: 200, marginBottom: 20 }}
                            onChange={this.handleAgeChange}
                        >
                            <Option value="">Todas por edad</Option>
                            <Option value="Apta">Apta</Option>
                            <Option value="7">+7</Option>
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
                        movie.linkTo = "/movie/"+movie.id;
                        let image = <img src={process.env.REACT_APP_SUPBASE_STORAGE + "imageMockup.png"} alt="Imagen por defecto"/>
                        if ( movie.cartel != null ){
                            image = <img src={"https://jfbitiqhttjjzcrxatys.supabase.co/storage/v1/object/public/images/" + movie.cartel} alt="Cartel película"/> 
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
                        total={this.state.movies.length}
                        onChange={this.handlePageChange}
                    />
                </div>
            </div>
        )
    }
}

export default MoviesList;