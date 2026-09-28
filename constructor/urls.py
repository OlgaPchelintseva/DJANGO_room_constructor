from django.urls import path
from . import views

urlpatterns = [
    path('', views.room_view, name='room'),
    path('save/<int:room_id>/', views.room_save, name='save_room'),
]