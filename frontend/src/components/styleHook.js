import { Button } from "@mui/material"
import { styled } from "@mui/system"

export const ClaimButton = styled(Button)(({ theme }) => ({
    color: "#F3B82F",
    fontSize: 36,
    fontWeight: 900,
    textTransform: "none",
    backgroundColor: "transparent",
    padding: "3px 24px",
    width: "100%",
    position: "relative",
    fontFamily: "Lexend Deca",
    borderRadius: 0,
    border: "4px solid #F3B82F",
    zIndex: 15,
    transition: "all 0.3s",
    marginTop: 30,
    '&:hover': {
        transform: "translateY(-2px)",
        transition: "all 0.3s"
    },
    '&:disabled': {
        color: "#F3B82F",
    }
}))

export const PrimaryButton = styled(Button)(({ theme }) => ({
    color: "white",
    fontSize: 36,
    fontWeight: 600,
    textTransform: "none",
    backgroundColor: "transparent",
    padding: "3px 24px",
    width: "100%",
    position: "relative",
    fontFamily: "Lexend Deca",
    borderRadius: "0.8rem",
    border: "3px solid #F3B82F",
    zIndex: 15,
    transition: "all 0.3s",
    marginTop: 30,
    maxWidth: "20rem",
    '&:hover': {
        transform: "translateY(-2px)",
        transition: "all 0.3s",
        backgroundColor: "#F3B82F",
    },
    '&:disabled': {
        color: "#F3B82F",
    }
}))

export const ContactButton = styled(Button)(({ theme }) => ({
    color: "white",
    fontSize: 30,
    fontWeight: 500,
    textTransform: "none",
    padding: "3px 24px",
    width: "100%",
    position: "relative",
    fontFamily: "Lexend Deca",
    borderRadius: "0.8rem",
    border: "3px solid #FFF",
    zIndex: 15,
    marginTop: 0,
    maxWidth: "20rem",
    float: 'right',
    '&:hover': {
        transform: "translateY(-2px)",
        transition: "all 0.3s",
    },
}))