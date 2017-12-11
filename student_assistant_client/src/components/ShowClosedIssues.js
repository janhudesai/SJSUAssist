import React, {Component} from 'react';
import favourite_empty from "../images/favourite_empty.png"
import favourite_filled from "../images/favourite_filled.png";
import Delete from "../images/Delete.png";
import directoryIcon from "../images/directory.png";
import fileIcon from "../images/file.png";
import share from "../images/share.png"

class ShowClosedIssues extends Component{

    constructor(){
        super();
        this.state = {
            hover: false,
        };
    }

    render(){

        const {issue} = this.props;

        return(
            <tbody>
            <tr>
                <td>Topic: </td>
                <td>{issue.skillId} </td>
            </tr>
            <tr>
                <td>Content: </td>
                <td>{issue.issueContent}</td>
            </tr>
            <tr>
                <button className="btn btn-primary" onClick={(()=>{this.props.viewIssue(issue)})}>View</button>
            </tr>
            </tbody>
        );
    }
}


export default ShowClosedIssues;