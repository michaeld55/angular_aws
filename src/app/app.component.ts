import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APIService } from './API.service';
import { Restaurant } from '../types/restaurant';
import { API } from 'aws-amplify';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'amplify-angular-app';
  public createForm: FormGroup;

  /* declare restaurants variable */
  restaurants: Array<Restaurant>;

  constructor(private api: APIService, private fb: FormBuilder) { 
    this.restaurants = [];
    this.createForm = new FormGroup({});
  }

  async ngOnInit() {
    this.createForm = this.fb.group({
      'name': ['', Validators.required],
      'description': ['', Validators.required],
      'city': ['', Validators.required]
    });

    /* fetch restaurants when app loads */
    this.api.ListRestaurants().then(event => {
      console.log(event.items)
      this.restaurants = event.items;
    });
    
    /* subscribe to new restaurants being created */
    this.api.OnCreateRestaurantListener.subscribe( (event: any) => {
      const newRestaurant = event.value.data.onCreateRestaurant;
      this.restaurants = [newRestaurant, ...this.restaurants];
    });
  }

  public onCreate(restaurant: Restaurant) {
    this.api.CreateRestaurant(restaurant).then(event => {
      console.log('item created!');
      this.createForm.reset();
    })
    .catch(e => {
      console.log('error creating restaurant...', e);
    });
  }

  public onClickDelete(removedRestaurant: Restaurant){
    const deleteId = removedRestaurant.id;
    this.restaurants = this.restaurants.filter(restaurant => restaurant.id !== deleteId);
    
    this.api.DeleteRestaurant({id: deleteId});{
      deleteId;
    }
  }

  public onClickEdit(editRestaurant: Restaurant){
    const editID = editRestaurant.id;
    this.createForm = this.fb.group({
      'name': [editRestaurant.name, Validators.required],
      'description': [editRestaurant.description, Validators.required],
      'city': [editRestaurant.city, Validators.required]
    });
  }

}