import React from 'react'
import {connect} from 'react-redux'
import styled from 'styled-components'
import {signIn, signOut} from '../../redux/auth/actions'
import Button from '../uielements/button'
import {palette} from 'styled-theme'

const GoogleButton = styled(Button)`
{
  background-color: ${palette('color', 9)};
  margin-top: 15px;
  color: #FFFFFF;
  
  &:hover {
    background-color: ${palette('color', 10)};
  }
}`


class GoogleAuth extends React.Component {
  componentDidMount() {
    window.gapi.load('client:auth2', () => {
      window.gapi.client
        .init({
          clientId:
            '427941496558-cinvoa6vcatjc6ckabmkjbip17ggp8rh.apps.googleusercontent.com',
          scope: 'email',
        })
        .then(() => {
          this.auth = window.gapi.auth2.getAuthInstance()

          this.onAuthChange(this.auth.isSignedIn.get())
          this.auth.isSignedIn.listen(this.onAuthChange)
        })
    })
  }

  onAuthChange = isSignedIn => {
    if (isSignedIn) {
      this.props.signIn(this.auth.currentUser.get().getId())
    } else {
      this.props.signOut()
    }
  }

  onSignInClick = () => {
    this.auth.signIn()
  }

  onSignOutClick = () => {
    this.auth.signOut()
  }

  renderAuthButton() {
    const {isSignedIn} = this.props

    return isSignedIn
      ? <GoogleButton onClick={this.onSignOutClick} icon="google" className="btnGooglePlus">
        Sign Out
      </GoogleButton>
      : <GoogleButton onClick={this.onSignInClick} icon="google" className="btnGooglePlus">
        Sign In with Google
      </GoogleButton>

    if (this.props.isSignedIn === null) {
      return null
    } else if (this.props.isSignedIn) {
      return (
        <button onClick={this.onSignOutClick} className="ui red google button">
          <i className="google icon"/>
          Sign Out
        </button>
      )
    } else {
      return (
        <button onClick={this.onSignInClick} className="ui red google button">
          <i className="google icon"/>
          Sign In with Google
        </button>
      )
    }
  }

  // renderAuthButton() {
  //   if (this.props.isSignedIn === null) {
  //     return null
  //   } else if (this.props.isSignedIn) {
  //     return (
  //       <button onClick={this.onSignOutClick} className="ui red google button">
  //         <i className="google icon"/>
  //         Sign Out
  //       </button>
  //     )
  //   } else {
  //     return (
  //       <button onClick={this.onSignInClick} className="ui red google button">
  //         <i className="google icon"/>
  //         Sign In with Google
  //       </button>
  //     )
  //   }
  // }
  //
  render() {
    return <div>{this.renderAuthButton()}</div>
  }
}

const mapStateToProps = state => {
  return {isSignedIn: state.Auth.isSignedIn}
}

export default connect(
  mapStateToProps,
  {signIn, signOut},
)(GoogleAuth)
