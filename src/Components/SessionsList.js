import React from 'react';
import withRouter from './withRouter';
import { Link } from "react-router-dom";
import { Card, Col, PageHeader, Row } from 'antd';

class SessionsList extends React.Component {

    constructor(props) {
        super(props)
        this.id = this.props.params.id
        this.state = {
            sessions : []
        }  
        this.getSessionsSummary(this.id);
    }

    getSessionsSummary = async (id) => {
        const { data, error } = await this.props.supabase
            .from('sessions_per_movie')
            .select('*')
            .eq('movie_id', id)
  
        if ( error == null){
            this.setState({
                sessions : data
            }) 
        }
    }  

    render() {
        function formatDate(date) {
            const [year, month, day] = date.split('-');
            return `${day}-${month}-${year}`;
        }

        function formatHour(hour) {
            const [hours, minutes] = hour.split(':');
            return `${hours}:${minutes}`;
        }

        return (
            <PageHeader title={ "Sesiones disponibles:" }>
                <Row gutter={ [16, 16] } >
                    { this.state.sessions.map( session => {
                        session.linkTo = "/movie/" + session.movieId + "/session/"+session.id;
                        return ( 
                            <Col xs={24} sm={12} md={8} lg={4} xl={3} >
                                <Link to={ session.linkTo }>
                                    <Card hoverable key={session.id} title={ session.title }>
                                        <p><i>{session.room}</i></p>
                                        <p>{formatDate(session.date)}</p>
                                        <p>{formatHour(session.hour)}</p>
                                    </Card>
                                </Link>
                            </Col>  
                        )
                    })}
                </Row>
            </PageHeader>
        )
    }
}

export default withRouter(SessionsList);