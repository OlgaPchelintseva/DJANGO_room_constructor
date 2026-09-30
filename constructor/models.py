from django.db import models

class Furniture(models.Model):
    name = models.CharField(max_length=100, verbose_name='Предмет')
    category = models.CharField(max_length=50, verbose_name='Категория')
    image = models.ImageField(upload_to='furniture/', verbose_name='Изображение предмета')

    class Meta:
        verbose_name = 'Предмет мебели'
        verbose_name_plural = 'Каталог мебели'

    def __str__(self):
        return f'{self.name} ({self.category})'
    
class Room(models.Model):
    name = models.CharField(max_length=50, default='Моя комната', verbose_name='Комната')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        verbose_name = 'Комната'
        verbose_name_plural = 'Комнаты'

    def __str__(self):
        return self.name
    
class RoomFurniture(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='placed_furniture', verbose_name='Комната')
    furniture = models.ForeignKey(Furniture, on_delete=models.CASCADE, verbose_name='Предмет мебели')
    x_pos = models.IntegerField(default=0, verbose_name='Координата X (px)')
    y_pos = models.IntegerField(default=0, verbose_name='Координата Y (px)')
    width = models.IntegerField(default=80, verbose_name='Ширина (px)')
    height = models.IntegerField(default=80, verbose_name='Высота (px)')
    rotation = models.IntegerField(default=0, verbose_name='Угол поворота (гр.)')

    class Meta:
        verbose_name = 'Размещенный предмет'
        verbose_name_plural = 'Размещенная мебель в комнатах'

    def __str__(self):
        return f'{self.furniture.name} в {self.room.name} [{self.x_pos}, {self.y_pos}]'