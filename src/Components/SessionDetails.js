import React from 'react';
import withRouter from './withRouter';
import { PageHeader, Descriptions, Image } from 'antd';

class SessionDetails extends React.Component {

    constructor(props) {
        super(props)
        this.id = this.props.params.id;
        this.state = {
            session : {}
        }
        this.getSessionDetails();
    }
  
    getSessionDetails = async () => {
        console.log(this.id);
        const { data, error } = await this.props.supabase
            .from('sessions_per_movie')
            .select()
            .eq('id', this.id )
  
        if ( error == null && data.length > 0){
            this.setState({
                session : data[0]
            }) 
        }
    }

    formatDate = (date) => {
        if (date) {
            const [year, month, day] = date.split('-');
            return `${day}-${month}-${year}`;
        }
        return '';
    }

    formatHour = (hour) => {
        if (hour) {
            const [hours, minutes] = hour.split(':');
            return `${hours}:${minutes}`;
        }
        return '';
    }
  
    render() {        
        let image = process.env.REACT_APP_SUPBASE_STORAGE + "/imageMockup.png";
        if (this.state.session.cartel != null) {
            image = "https://jfbitiqhttjjzcrxatys.supabase.co/storage/v1/object/public/images/" + this.state.session.cartel;
        }
        const bold = {
            fontWeight: 'bold'
        }

        return (
            <PageHeader title={ this.state.session.title } 
                ghost={false} onBack={() => window.history.back()}>
                <div style={{ display: 'flex', marginTop: 10, marginBottom: 8}}>
                    <div style={{ marginRight: 35 }}>
                        <Image width={200} src={ image }/>
                    </div>    
                    <Descriptions>
                        <Descriptions.Item span={3}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ ...bold, minWidth: 60 }}>Sala:</span>
                                <span><i>{this.state.session.room}</i></span>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item span={3}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ ...bold, minWidth: 60 }}>Fecha:</span>
                                <span>{this.formatDate(this.state.session.date)}</span>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item span={3}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ ...bold, minWidth: 60 }}>Hora:</span>
                                <span>{this.formatHour(this.state.session.hour)}</span>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            </PageHeader>
        )
    }
}

export default withRouter(SessionDetails);