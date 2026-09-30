from django.urls import path
from . import views

urlpatterns = [
    path('', views.room_view, name='room'),
    path('room/<int:room_id>/save/', views.room_save, name='save_room'),
]