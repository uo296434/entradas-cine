import React from 'react';
import withRouter from './withRouter';
import { PageHeader, Descriptions, Image } from 'antd';

class NextPremiereDetails extends React.Component {

    constructor(props) {
        super(props)
        this.id = this.props.params.id;
        this.state = {
            nextpremiere : {}
        }
        this.getNextPremiereDetails();
    }
  
    getNextPremiereDetails = async () => {
        const { data, error } = await this.props.supabase
            .from('next_premiere')
            .select()
            .eq('id', this.id )
  
        if ( error == null && data.length > 0){
            this.setState({
                nextpremiere : data[0]
            }) 
        }
    }
  
    render() {
        let image = process.env.REACT_APP_SUPBASE_STORAGE + "/imageMockup.png";
        if (this.state.nextpremiere.id != null) {
            image = "https://jfbitiqhttjjzcrxatys.supabase.co/storage/v1/object/public/images/" + this.state.nextpremiere.cartel;
        }
        const bold = {
            fontWeight: 'bold'
        }
        return (
            <PageHeader title={ this.state.nextpremiere.title }
                ghost={false} onBack={() => window.history.back()}>
                <div style={{ display: 'flex', marginTop: 10, marginBottom: 8}}>
                    <div style={{ marginRight: 35 }}>
                        <Image width={250} src={ image }/>
                    </div>                    
                    <Descriptions>
                        <Descriptions.Item span={3}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ ...bold, minWidth: 150 }}>Género:</span>
                                <span>{this.state.nextpremiere.genre}</span>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item span={3}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ ...bold, minWidth: 150 }}>Director:</span>
                                <span>{this.state.nextpremiere.director}</span>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item span={3}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ ...bold, minWidth: 150 }}>Estreno:</span>
                                <span>{this.state.nextpremiere.premiere}</span>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item span={3}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ ...bold, minWidth: 150 }}>Duración:</span>
                                <span>{this.state.nextpremiere.duration}</span>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item span={3}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ ...bold, minWidth: 150 }}>Edad recomendada:</span>
                                <span>{this.state.nextpremiere.recommended_age}</span>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item span={3}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ ...bold, minWidth: 150 }}>Sinopsis:</span>
                                <span>{this.state.nextpremiere.synopsis}</span>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            </PageHeader>
        )
    }
}

export default withRouter(NextPremiereDetails);