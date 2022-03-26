import React, { Component } from "react";
import {
  Card,
  CardImg,
  CardText,
  CardBody,
  CardTitle,
  Breadcrumb,
  BreadcrumbItem,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Label,
} from "reactstrap";
import { Control, LocalForm, Errors } from "react-redux-form";
import { Link, useParams } from "react-router-dom";
import { Loading } from "./LoadingComponent";
import { baseUrl } from "../shared/baseUrl";

class CommentForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rating: "",
      author: "",
      comment: "",
      isModalOpen: false,
      touched: {
        author: false,
      },
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  toggleModal() {
    this.setState({
      isModalOpen: !this.state.isModalOpen,
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  handleSubmit(values) {
    this.toggleModal();
    console.log("Current State is: " + JSON.stringify(values));
    this.props.postComment(
      this.props.dishId,
      values.rating,
      values.author,
      values.comment
    );
    //event.preventDefault();
  }

  handleBlur = (field) => (evt) => {
    this.setState({
      touched: { ...this.state.touched, [field]: true },
    });
  };
  validate(author) {
    const errors = {
      author: "",
    };

    if (this.state.touched.author && author.length < 3)
      errors.author = "Author should be >= 3 characters";
    else if (this.state.touched.author && author.length > 10)
      errors.author = "Author should be <= 10 characters";

    return errors;
  }

  render() {
    const required = (val) => val && val.length;
    const maxLength = (len) => (val) => !val || val.length <= len;
    const minLength = (len) => (val) => val && val.length >= len;

    return (
      <>
        <Button outline onClick={this.toggleModal}>
          <span className="fa fa-sign-in fa-lg"></span> Submit Comment
        </Button>
        <Modal isOpen={this.state.isModalOpen} toggle={this.toggleModal}>
          <ModalHeader toggle={this.toggleModal}>Submit Comment</ModalHeader>
          <ModalBody>
            <LocalForm onSubmit={(values) => this.handleSubmit(values)}>
              <Label htmlFor="rating">Rating </Label>
              <Control.select
                model=".rating"
                id="rating"
                name="rating"
                className="form-control"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Control.select>
              <Label htmlFor="author">Your Name</Label>
              <Control.text
                model=".author"
                id="author"
                name="author"
                placeholder="Your Name"
                className="form-control"
                validators={{
                  required,
                  minLength: minLength(3),
                  maxLength: maxLength(15),
                }}
              />
              <Errors
                className="text-danger"
                model=".author"
                show="touched"
                messages={{
                  required: "Required",
                  minLength: "Must be greater than 2 characters",
                  maxLength: "Must be 15 characters or less",
                }}
              />
              <Label htmlFor="comment">Comment</Label>
              <Control.textarea
                model=".comment"
                id="comment"
                name="comment"
                rows="6"
                className="form-control"
              />
              <Button type="submit" color="primary">
                Submit
              </Button>
            </LocalForm>
          </ModalBody>
        </Modal>
      </>
    );
  }
}

function RenderDish({ dish }) {
  return (
    <Card>
      <CardImg top src={baseUrl + dish.image} alt={dish.name} />
      <CardBody>
        <CardTitle>{dish.name}</CardTitle>
        <CardText>{dish.description}</CardText>
      </CardBody>
    </Card>
  );
}

function RenderComments({ comments, postComment, dishId }) {
  if (comments != null) {
    const list = comments.map((comment) => {
      return (
        <li key={comment.id}>
          <p>{comment.comment}</p>
          <p>
            -- {comment.author},{" "}
            {new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            }).format(new Date(Date.parse(comment.date)))}
          </p>
        </li>
      );
    });
    return (
      <>
        <ul className="list-unstyled">
          <h4>Comments</h4>
          {list}
          <li></li>
        </ul>
        <CommentForm dishId={dishId} postComment={postComment} />
      </>
    );
  } else return <div></div>;
}

const DishDetail = (props) => {
  let params = useParams();
  let dish = props.dishes.dishes.filter(
    (dish) => dish.id === parseInt(params.dishId, 10)
  )[0];
  let comments = props.comments.comments.filter(
    (comment) => comment.dishId === parseInt(params.dishId, 10)
  );

  if (props.isLoading) {
    return (
      <div className="container">
        <div className="row">
          <Loading />
        </div>
      </div>
    );
  } else if (props.errMess) {
    return (
      <div className="container">
        <div className="row">
          <h4>{props.errMess}</h4>
        </div>
      </div>
    );
  } else if (dish != null) {
    return (
      <div className="container">
        <div className="row">
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to="/menu">Menu</Link>
            </BreadcrumbItem>
            <BreadcrumbItem active>{dish.name}</BreadcrumbItem>
          </Breadcrumb>
          <div className="col-12">
            <h3>{dish.name}</h3>
            <hr />
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-md-5 m-1">
            <RenderDish dish={dish} />
          </div>
          <div className="col-12 col-md-5 m-1">
            <RenderComments
              comments={comments}
              postComment={props.postComment}
              dishId={dish.id}
            />
          </div>
        </div>
      </div>
    );
  } else return <div></div>;
};

export default DishDetail;
