import { YesNoPipe } from './yes-no.pipe';

describe('YesNoPipe', () => {
  it('maps true to "Completada"', () => {
    const pipe = new YesNoPipe();
    expect(pipe.transform(true)).toBe('Completada');
  });

  it('maps false to "Pendiente"', () => {
    const pipe = new YesNoPipe();
    expect(pipe.transform(false)).toBe('Pendiente');
  });
});

