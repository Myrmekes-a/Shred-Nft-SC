import { useState } from "react";
import Container from "./Container";
import footerImage from '../assets/img/cropped-transparent_logo.png'
import { ContactButton, PrimaryButton } from "./styleHook";
import { warningAlert } from "./toastGroup";

export default function Footer() {
  const [signUpShow, setSignUpShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const onChangeName = (e) => {
    if (e.target.value) setName(e.target.value)
    else setName('')
  }

  const onChangeEmail = (e) => {
    if (e.target.value) setEmail(e.target.value)
    else setEmail('')
  }

  const onShowSignUp = () => {
    if (name === '') {
      warningAlert('Please input Name!');
      return;
    }
    if (email === '') {
      warningAlert('Please input Email!');
      return;
    }
    setSignUpShow(true);
  }

  return (
    <footer>
      <Container>
        <div className="footer-body">
          <div className="footer-content">
            Stay up to date<br/>
            <span>Gym’ Newsletter</span>
          </div>
          <div className="footer-content">
            <div className="contact">
              <span>Name</span>
              <input type='text' name='name' value={name} onChange={onChangeName} />
            </div>
            <div className="contact">
              <span>Email</span>
              <input type='email' name='email' value={email} onChange={onChangeEmail} />
            </div>
            <ContactButton className={"active"} style={{}} disabled={false} onClick={onShowSignUp}>
              COUNT ME IN!
            </ContactButton>
          </div>
        </div>
        <div className="footer-image">
          <img
            src={footerImage}
            alt=""
          />
        </div>
        { signUpShow &&
          <div className="footer-signup-confirm-msg">
            <div className="footer-msg-container">
              <p>Are you sure sign up with this name and email?</p>
              <span>{name}</span><br/>
              <span>{email}</span>
              <div>
                <PrimaryButton className={""} style={{}} disabled={false} onClick={() => {setSignUpShow(false)}}>
                  Confirm
                </PrimaryButton>
                <PrimaryButton className={""} style={{}} disabled={false} onClick={() => {setSignUpShow(false)}}>
                  Cancel
                </PrimaryButton>
              </div>
            </div>
          </div>
        }
      </Container>
    </footer>
  )
}